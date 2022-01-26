import type { FlowSdk } from "@rarible/flow-sdk"
import { toFlowContractAddress, toFlowItemId } from "@rarible/flow-sdk"
import { Action } from "@rarible/action"
import { Blockchain } from "@rarible/api-client"
import { toAuctionId } from "@rarible/types/build/auction-id"
import { BlockchainFlowTransaction } from "@rarible/sdk-transaction"
import type { FlowNetwork } from "@rarible/flow-sdk/build/types"
import {
	getFlowCollection,
	getFungibleTokenName, parseOrderId,
	parseUnionItemId,
	toFlowParts,
} from "../common/converters"
import type { IStartAuctionRequest, PrepareStartAuctionResponse } from "../../../types/auction/start"
import type { PrepareOrderInternalRequest } from "../../../types/order/common"
import { OriginFeeSupport, PayoutsSupport } from "../../../types/order/fill/domain"
import type { CurrencyType } from "../../../common/domain"
import { getFlowBaseFee } from "../common/get-flow-base-fee"
import type { FinishAuctionRequest, IAuctionFinish } from "../../../types/auction/finish"
import type { CancelAuctionRequest } from "../../../types/auction/cancel"
import type { IPutBidRequest } from "../../../types/auction/put-bid"
import type { IBuyoutRequest } from "../../../types/auction/buy-out"

export class FlowAuction {
	static supportedCurrencies: CurrencyType[] = [{
		blockchain: Blockchain.FLOW,
		type: "NATIVE",
	}]
	constructor(
		private sdk: FlowSdk,
		private network: FlowNetwork,
	) {
		this.start = this.start.bind(this)
		this.finish = this.finish.bind(this)
		this.cancel = this.cancel.bind(this)
		this.createBid = this.createBid.bind(this)
	}

	async start(prepareRequest: PrepareOrderInternalRequest): Promise<PrepareStartAuctionResponse> {
		const [domain] = prepareRequest.collectionId.split(":")
		if (domain !== Blockchain.FLOW) {
			throw new Error("Not an flow item")
		}
		const collection = getFlowCollection(prepareRequest.collectionId)

		const auctionStartAction = Action.create({
			id: "send-tx" as const,
			run: async (request: IStartAuctionRequest) => {
				if (request.currency["@type"] === "FLOW_FT") {
					const currency = getFungibleTokenName(request.currency.contract)
					return this.sdk.auction.createLot({
						collection,
						increment: request.minimalStep.toString(),
						minimumBid: request.minimalPrice.toString(),
						duration: request.duration.toString(),
						itemId: toFlowItemId(parseUnionItemId(request.itemId).itemId),
						currency,
						startAt: request.startTime?.toString(),
						buyoutPrice: request.buyOutPrice?.toString(),
						payouts: toFlowParts(request.payouts),
						originFees: toFlowParts(request.originFees),
					})
				}
				throw new Error(`Unsupported currency type: ${request.currency["@type"]}`)
			},
		}).after((tx) => toAuctionId(`${Blockchain.FLOW}:${tx.orderId}`))

		return {
			multiple: false,
			originFeeSupport: OriginFeeSupport.FULL,
			payoutsSupport: PayoutsSupport.NONE,
			supportedCurrencies: FlowAuction.supportedCurrencies,
			baseFee: getFlowBaseFee(this.sdk),
			submit: auctionStartAction,
		}
	}

	finish: IAuctionFinish = Action.create({
		id: "send-tx" as const,
		run: async (request: FinishAuctionRequest) => {
			const auctionId = parseOrderId(request.auctionId)
			const { collection } = await this.sdk.apis.order.getOrderByOrderId({ orderId: auctionId.toString() })
			const tx = await this.sdk.auction.completeLot({ collection: toFlowContractAddress(collection), lotId: auctionId })
			return new BlockchainFlowTransaction(tx, this.network)
		},
	})

	cancel = Action.create({
		id: "send-tx" as const,
		run: async (request: CancelAuctionRequest) => {
			const auctionId = parseOrderId(request.auctionId)
			const { collection } = await this.sdk.apis.order.getOrderByOrderId({ orderId: auctionId.toString() })
			const tx = await this.sdk.auction.cancelLot({ collection: toFlowContractAddress(collection), lotId: auctionId })
			return new BlockchainFlowTransaction(tx, this.network)
		},
	})
	// todo implement flow increase bid
	createBid = Action.create({
		id: "send-tx" as const,
		run: async (request: IPutBidRequest) => {
			const auctionId = parseOrderId(request.auctionId)
			const { collection } = await this.sdk.apis.order.getOrderByOrderId({ orderId: auctionId.toString() })
			const tx = await this.sdk.auction.createBid({
				collection: toFlowContractAddress(collection),
				lotId: auctionId,
				amount: request.price.toString(),
				originFee: toFlowParts(request.originFees),
			})
			return new BlockchainFlowTransaction(tx, this.network)
		},
	})

	buyOut = Action.create({
		id: "send-tx" as const,
		run: async (request: IBuyoutRequest) => {
			const auctionId = parseOrderId(request.auctionId)
			const { collection, make } = await this.sdk.apis.order.getOrderByOrderId({ orderId: auctionId.toString() })
			const tx = await this.sdk.auction.createBid({
				collection: toFlowContractAddress(collection),
				lotId: auctionId,
				amount: make.value,
				originFee: toFlowParts(request.originFees),
			})
			return new BlockchainFlowTransaction(tx, this.network)
		},
	})
}
