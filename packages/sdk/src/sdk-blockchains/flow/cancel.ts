import type { FlowSdk } from "@rarible/flow-sdk"
import { Action } from "@rarible/action"
import { BlockchainFlowTransaction } from "@rarible/sdk-transaction"
import type { FlowNetwork } from "@rarible/flow-sdk/build/types"
import type { IApisSdk } from "../../domain"
import type { CancelOrderRequest, ICancel } from "../../types/order/cancel/domain"
import { getFlowCollection, parseOrderId } from "./common/converters"

export class FlowCancel {
	constructor(
		private sdk: FlowSdk,
		private apis: IApisSdk,
		private network: FlowNetwork,
	) {
		this.cancel = this.cancel.bind(this)
	}

	readonly cancel: ICancel = Action.create({
		id: "send-tx" as const,
		run: async (request: CancelOrderRequest) => {
			if (!request.orderId) {
				throw new Error("OrderId has not been specified")
			}
			const parsed = parseOrderId(request.orderId)
			const order = await this.apis.order.getOrderById({
				id: request.orderId,
			})
			switch (order.make.type["@type"]) {
				case "FLOW_NFT": {
					if (order.take.type["@type"] !== "FLOW_FT") {
						throw new Error("Invalid Flow order, make asset is not a Flow asset")
					}
					const tx = await this.sdk.order.cancelOrder(getFlowCollection(order.make.type.contract), parsed)
					return new BlockchainFlowTransaction(tx, this.network)
				}
				case "FLOW_FT": {
					if (order.take.type["@type"] !== "FLOW_NFT") {
						throw new Error("Invalid Flow bid order, take asset is not a Flow asset")
					}
					const tx = await this.sdk.order.cancelBid(getFlowCollection(order.take.type.contract), parsed)
					return new BlockchainFlowTransaction(tx, this.network)
				}
				default:
					throw new Error("Not an Flow order")
			}
		},
	})
}
