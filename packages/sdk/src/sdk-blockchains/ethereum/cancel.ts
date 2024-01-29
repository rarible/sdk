import type { RaribleSdk } from "@rarible/protocol-ethereum-sdk"
import type { IBlockchainTransaction } from "@rarible/sdk-transaction"
import { BlockchainEthereumTransaction } from "@rarible/sdk-transaction"
import type { Maybe } from "@rarible/types/build/maybe"
import type { EthereumWallet } from "@rarible/sdk-wallet"
import type { CancelOrderRequest } from "../../types/order/cancel/domain"
import type { IApisSdk } from "../../domain"
import { getEthOrder, getWalletNetwork, isEVMBlockchain } from "./common"

export class EthereumCancel {
	constructor(
		private readonly sdk: RaribleSdk,
		private wallet: Maybe<EthereumWallet>,
		private apis: IApisSdk,
	) {
		this.cancel = this.cancel.bind(this)
	}

	async cancel(request: CancelOrderRequest): Promise<IBlockchainTransaction> {
		if (!request.orderId) {
			throw new Error("OrderId has not been specified")
		}
		const [blockchain] = request.orderId.split(":")
		if (!isEVMBlockchain(blockchain)) {
			throw new Error("Not an ethereum order")
		}
		const order = await this.apis.order.getValidatedOrderById({
			id: request.orderId,
		})
		const cancelTx = await this.sdk.order.cancel(
			getEthOrder(order)
		)
		return new BlockchainEthereumTransaction(cancelTx, await getWalletNetwork(this.wallet))
	}
}
