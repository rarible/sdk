import { toBigNumber } from "@rarible/types/build/big-number"
import type { FlowSdk } from "@rarible/flow-sdk"
import { Action } from "@rarible/action"
import type { Order, UnionAddress } from "@rarible/api-client"
import { BlockchainFlowTransaction } from "@rarible/sdk-transaction"
import type { IApisSdk } from "../../domain"
import type { FillRequest, PrepareFillRequest, PrepareFillResponse } from "../../types/order/fill/domain"
import { OriginFeeSupport, PayoutsSupport } from "../../types/order/fill/domain"
import * as converters from "./common/converters"

export class FlowBuy {
	constructor(private sdk: FlowSdk, private readonly apis: IApisSdk) {
		this.buy = this.buy.bind(this)
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

	private getFlowContract(order: Order): UnionAddress {
		if (order.make.type["@type"] === "FLOW_NFT") {
			return order.make.type.contract
		}
		throw new Error("This is not FLOW order")
	}

	private getFlowCurrency(order: Order) {
		if (order.take.type["@type"] === "FLOW_FT") {
			return converters.getFungibleTokenName(order.take.type.contract)
		}
		throw new Error("Invalid order take asset")
	}

	async buy(request: PrepareFillRequest): Promise<PrepareFillResponse> {
		const order = await this.getPreparedOrder(request)
		const submit = Action
			.create({
				id: "send-tx" as const,
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				run: (buyRequest: FillRequest) => {
					const currency = this.getFlowCurrency(order)
					const owner = converters.parseFlowAddressFromUnionAddress(order.maker)
					const collectionId = converters.getFlowCollection(this.getFlowContract(order))
					// @todo leave string when support it on flow-sdk transactions
					const orderId = parseInt(converters.parseOrderId(order.id))
					return this.sdk.order.buy(collectionId, currency, orderId, owner)
				},
			})
			.after(tx => new BlockchainFlowTransaction(tx))

		return {
			multiple: false,
			maxAmount: toBigNumber("1"),
			baseFee: 250,
			supportsPartialFill: false,
			// @todo not supported on flow yet
			originFeeSupport: OriginFeeSupport.NONE,
			payoutsSupport: PayoutsSupport.NONE,
			submit,
		}
	}
}
