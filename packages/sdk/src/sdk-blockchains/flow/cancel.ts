import type { FlowSdk } from "@rarible/flow-sdk"
import { Action } from "@rarible/action"
import type { Order, UnionAddress } from "@rarible/api-client"
import { BlockchainFlowTransaction } from "@rarible/sdk-transaction"
import type { IApisSdk } from "../../domain"
import type { CancelOrderRequest, ICancel } from "../../types/order/cancel/domain"
import { getFlowCollection, parseOrderId } from "./common/converters"

export class FlowCancel {
	constructor(private sdk: FlowSdk, private apis: IApisSdk) {
		this.cancel = this.cancel.bind(this)
	}

	private getFlowContract(order: Order): UnionAddress {
		if (order.make.type["@type"] === "FLOW_NFT") {
			return order.make.type.contract
		}
		throw new Error("This is not FLOW order")
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
			const collectionId = getFlowCollection(this.getFlowContract(order))
			const tx = await this.sdk.order.cancelOrder(collectionId, parseInt(parsed))
			return new BlockchainFlowTransaction(tx)
		},
	})
}
