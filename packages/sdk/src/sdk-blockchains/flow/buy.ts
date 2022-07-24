import { toBigNumber } from "@rarible/types/build/big-number"
import type { FlowSdk } from "@rarible/flow-sdk"
import { Action } from "@rarible/action"
import type { Order } from "@rarible/api-client"
import type { IBlockchainTransaction } from "@rarible/sdk-transaction"
import { BlockchainFlowTransaction } from "@rarible/sdk-transaction"
import type { ContractAddress } from "@rarible/types"
import type { FlowNetwork } from "@rarible/flow-sdk/build/types"
import type { IApisSdk } from "../../domain"
import type { FillRequest, PrepareFillRequest, PrepareFillResponse } from "../../types/order/fill/domain"
import { OriginFeeSupport, PayoutsSupport } from "../../types/order/fill/domain"
import type { BuySimplifiedRequest } from "../../types/order/fill/simplified"
import type { AcceptBidSimplifiedRequest } from "../../types/order/fill/simplified"
import * as converters from "./common/converters"
import { toFlowParts } from "./common/converters"
import { getFlowBaseFee } from "./common/get-flow-base-fee"

export class FlowBuy {
	constructor(
		private sdk: FlowSdk,
		private readonly apis: IApisSdk,
		private network: FlowNetwork,
	) {
		this.buy = this.buy.bind(this)
		this.buyBasic = this.buyBasic.bind(this)
		this.acceptBidBasic = this.acceptBidBasic.bind(this)
	}

	private async getPreparedOrder(request: PrepareFillRequest): Promise<Order> {
		if ("order" in request) {
			return request.order
		}
		if ("orderId" in request) {
			// @todo replace this api call for call from flow-sdk when it supported
			return this.apis.order.getOrderById({ id: request.orderId })
		}
		throw new Error("Incorrect request")
	}

	private getFlowNftContract(order: Order): ContractAddress {
		if (order.make.type["@type"] === "FLOW_NFT") {
			return order.make.type.contract
		} else if (order.take.type["@type"] === "FLOW_NFT") {
			return order.take.type.contract
		} else {
			throw new Error("This is not FLOW order")
		}
	}

	private getFlowCurrency(order: Order) {
		if (order.take.type["@type"] === "FLOW_FT") {
			return converters.getFungibleTokenName(order.take.type.contract)
		} else if (order.make.type["@type"] === "FLOW_FT") {
			return converters.getFungibleTokenName(order.make.type.contract)
		} else {
			throw new Error("No Flow fungible token found in order take and make values")
		}

	}

	async buy(request: PrepareFillRequest): Promise<PrepareFillResponse> {
		const submit = Action
			.create({
				id: "send-tx" as const,
				run: (buyRequest: FillRequest) => {
					return this.buyCommon({
						...buyRequest,
						...request,
					})
				},
			})

		return {
			multiple: false,
			maxAmount: toBigNumber("1"),
			baseFee: getFlowBaseFee(this.sdk),
			supportsPartialFill: false,
			originFeeSupport: OriginFeeSupport.FULL,
			payoutsSupport: PayoutsSupport.NONE,
			submit,
		}
	}

	async buyCommon(buyRequest: FillRequest & PrepareFillRequest) {
		const order = await this.getPreparedOrder(buyRequest)
		const currency = this.getFlowCurrency(order)
		const owner = converters.parseFlowAddressFromUnionAddress(order.maker)
		const collectionId = converters.getFlowCollection(this.getFlowNftContract(order))
		const orderId = converters.parseOrderId(order.id)
		const tx = await this.sdk.order.fill(
			collectionId,
			currency,
			orderId,
			owner,
			toFlowParts(buyRequest.originFees)
		)
		return new BlockchainFlowTransaction(tx, this.network)
	}

	async buyBasic(request: BuySimplifiedRequest): Promise<IBlockchainTransaction> {
		return this.buyCommon(request)
	}

	async acceptBidBasic(request: AcceptBidSimplifiedRequest): Promise<IBlockchainTransaction> {
		return this.buyCommon(request)
	}
}
