import type { FlowNetwork, FlowSdk } from "@rarible/flow-sdk"
import { toFlowItemId } from "@rarible/flow-sdk"
import { Action } from "@rarible/action"
import { Blockchain } from "@rarible/api-client"
import { toAuctionId } from "@rarible/types/build/auction-id"
import { BlockchainFlowTransaction } from "@rarible/sdk-transaction"
import {
	getFlowCollection,
	getFungibleTokenName,
	parseOrderId,
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
import { awaitAuction } from "./common/await-auction"

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
		this.buyOut = this.buyOut.bind(this)
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
					const {
						itemId,
						contract,
					} = parseUnionItemId(request.itemId)
					return this.sdk.auction.createLot({
						collection,
						increment: request.minimalStep.toString(),
						minimumBid: request.minimalPrice.toString(),
						duration: request.duration.toString(),
						itemId: toFlowItemId(`${contract}:${itemId}`),
						currency,
						startAt: request.startTime?.toString(),
						buyoutPrice: request.buyOutPrice.toString(),
						originFees: toFlowParts(request.originFees),
					})
				}
				throw new Error(`Unsupported currency type: ${request.currency["@type"]}`)
			},
		}).after((tx) => ({
			tx: new BlockchainFlowTransaction(tx, this.network),
			auctionId: toAuctionId(`${Blockchain.FLOW}:${tx.lotId}`),
		}))

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
			const { sell } = await awaitAuction(this.sdk, auctionId)
			const tx = await this.sdk.auction.completeLot({
				collection: sell.contract,
				lotId: auctionId.toString(),
			})
			return new BlockchainFlowTransaction(tx, this.network)
		},
	})

	cancel = Action.create({
		id: "send-tx" as const,
		run: async (request: CancelAuctionRequest) => {
			const auctionId = parseOrderId(request.auctionId)
			const { sell } = await awaitAuction(this.sdk, auctionId)
			const tx = await this.sdk.auction.cancelLot({
				collection: sell.contract,
				lotId: auctionId.toString(),
			})
			return new BlockchainFlowTransaction(tx, this.network)
		},
	})

	createBid = Action.create({
		id: "send-tx" as const,
		run: async (request: IPutBidRequest) => {
			const auctionId = parseOrderId(request.auctionId)
			const { sell } = await awaitAuction(this.sdk, auctionId)
			const tx = await this.sdk.auction.createBid({
				collection: sell.contract,
				lotId: auctionId.toString(),
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
			const {
				sell,
				buyoutPrice,
			} = await awaitAuction(this.sdk, auctionId)
			if (!buyoutPrice) {
				throw new Error("Auction lod doesn't have buyout price")
			}
			const tx = await this.sdk.auction.createBid({
				collection: sell.contract,
				lotId: auctionId.toString(),
				amount: buyoutPrice.toString(),
				originFee: toFlowParts(request.originFees),
			})
			return new BlockchainFlowTransaction(tx, this.network)
		},
	})
}
