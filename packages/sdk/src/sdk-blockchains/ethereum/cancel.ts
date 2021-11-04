import { RaribleSdk } from "@rarible/protocol-ethereum-sdk"
import { EthereumWallet } from "@rarible/sdk-wallet"
import { Action } from "@rarible/action"
import { BlockchainEthereumTransaction } from "@rarible/sdk-transaction"
import { CancelOrderRequest, ICancel } from "../../types/order/cancel/domain"

export class CancelOrder {
	constructor(
		private sdk: RaribleSdk,
		private wallet: EthereumWallet
	) {}

	cancel: ICancel = Action.create({
		id: "send-tx" as const,
		run: async (request: CancelOrderRequest) => {
			if (!request.orderId) {
				throw new Error("OrderId has not been specified")
			}
			const [blockchain, orderId] = request.orderId.split(":")
			if (blockchain !== "ETHEREUM") {
				throw new Error("Not an ethereum order")
			}

			const order = await this.sdk.apis.order.getOrderByHash({
				hash: orderId,
			})

			const cancelTx = await this.sdk.order.cancel(order)
			return new BlockchainEthereumTransaction(cancelTx)
		},
	})
}
