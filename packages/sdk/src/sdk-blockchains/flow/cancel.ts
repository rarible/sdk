import { FlowSdk } from "@rarible/flow-sdk"
import { FlowWallet } from "@rarible/sdk-wallet"
import { Action } from "@rarible/action"
import { Order } from "@rarible/api-client"
import { BlockchainFlowTransaction } from "@rarible/sdk-transaction"
import { CancelOrderRequest, ICancel } from "../../order/cancel/domain"
import { getFlowCollection } from "./common/converters"
import { api } from "./common/api"

export class FlowCancel {
	constructor(
		private sdk: FlowSdk,
		private wallet: FlowWallet
	) {
		this.cancel = this.cancel.bind(this)
	}

	async getOrderById(orderId: string): Promise<Order> {
		return api(this.wallet.network).orderController.getOrderById({ id: orderId })
	}

	getFlowContract(order: Order): string {
		if (order.make.type["@type"] === "FLOW_NFT") {
			return order.make.type.contract
		}
		throw Error("This is not FLOW order")
	}

	cancel: ICancel = Action.create({
		id: "send-tx" as const,
		run: async (request: CancelOrderRequest) => {
			if (!request.orderId) {
				throw new Error("OrderId has not been specified")
			}
			const [blockchain, orderId] = request.orderId.split(":")
			if (blockchain !== "FLOW") {
				throw new Error("Not an flow order")
			}
			const order = await this.getOrderById(`FLOW:${orderId}`)
			const collectionId = getFlowCollection(this.getFlowContract(order))
			const tx = await this.sdk.order.cancelOrder(collectionId, parseInt(orderId))
			return new BlockchainFlowTransaction(tx)
		},
	})
}
