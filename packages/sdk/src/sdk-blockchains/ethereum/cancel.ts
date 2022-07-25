import type { RaribleSdk } from "@rarible/protocol-ethereum-sdk"
import type { IBlockchainTransaction } from "@rarible/sdk-transaction"
import { BlockchainEthereumTransaction } from "@rarible/sdk-transaction"
import type { EthereumNetwork } from "@rarible/protocol-ethereum-sdk/build/types"
import type { CancelOrderRequest } from "../../types/order/cancel/domain"
import { isEVMBlockchain } from "./common"

export class EthereumCancel {
	constructor(
		private readonly sdk: RaribleSdk,
		private network: EthereumNetwork,
	) {
		this.cancelBasic = this.cancelBasic.bind(this)
	}

	async cancelCommon(request: CancelOrderRequest): Promise<IBlockchainTransaction> {
		if (!request.orderId) {
			throw new Error("OrderId has not been specified")
		}
		const [blockchain, orderId] = request.orderId.split(":")
		if (!isEVMBlockchain(blockchain)) {
			throw new Error("Not an ethereum order")
		}

		const order = await this.sdk.apis.order.getOrderByHash({
			hash: orderId,
		})

		const cancelTx = await this.sdk.order.cancel(order)
		return new BlockchainEthereumTransaction(cancelTx, this.network)
	}

	async cancelBasic(request: CancelOrderRequest): Promise<IBlockchainTransaction> {
		return this.cancelCommon(request)
	}
}
