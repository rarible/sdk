import type { RaribleSdk } from "@rarible/protocol-ethereum-sdk"
import type { IBlockchainTransaction } from "@rarible/sdk-transaction"
import { BlockchainEthereumTransaction } from "@rarible/sdk-transaction"
import type { Maybe } from "@rarible/types/build/maybe"
import type { EthereumWallet } from "@rarible/sdk-wallet"
import type { RaribleEthereumApis } from "@rarible/protocol-ethereum-sdk/build/common/apis"
import type { CancelOrderRequest } from "../../types/order/cancel/domain"
import { checkWalletBlockchain, getWalletNetwork, isEVMBlockchain } from "./common"

export class EthereumCancel {
	constructor(
		private readonly sdk: RaribleSdk,
		private wallet: Maybe<EthereumWallet>,
		private getEthereumApis: () => Promise<RaribleEthereumApis>,
	) {
		this.cancel = this.cancel.bind(this)
	}

	async cancel(request: CancelOrderRequest): Promise<IBlockchainTransaction> {
		if (!request.orderId) {
			throw new Error("OrderId has not been specified")
		}
		const [blockchain, orderId] = request.orderId.split(":")
		if (!isEVMBlockchain(blockchain)) {
			throw new Error("Not an ethereum order")
		}
		await checkWalletBlockchain(this.wallet, blockchain)
		const ethApis = await this.getEthereumApis()
		const order = await ethApis.order.getValidatedOrderByHash({
			hash: orderId,
		})
		const cancelTx = await this.sdk.order.cancel(order)
		return new BlockchainEthereumTransaction(cancelTx, await getWalletNetwork(this.wallet))
	}
}
