import { Blockchain } from "@rarible/api-client"
import type { EthereumTransaction } from "@rarible/ethereum-provider"
import type { EthereumNetwork } from "@rarible/protocol-ethereum-sdk/build/types"
import type { IBlockchainTransaction } from "../domain"

export class BlockchainEthereumTransaction<TransactionResult = undefined> implements
IBlockchainTransaction<Blockchain, TransactionResult> {
	blockchain: Blockchain

	constructor(
		public transaction: EthereumTransaction,
		public network: EthereumNetwork,
		public resultExtractor?: (receipt: Awaited<ReturnType<EthereumTransaction["wait"]>>) => TransactionResult | undefined,
	) {
		this.blockchain = this.getBlockchain(network)
	}

	private getBlockchain(network: EthereumNetwork): Blockchain {
		switch (network) {
			case "mumbai":
			case "polygon":
				return Blockchain.POLYGON
			default:
				return Blockchain.ETHEREUM
		}
	}

	hash() {
		return this.transaction.hash
	}

	async wait() {
		const receipt = await this.transaction.wait()

		return {
			blockchain: this.blockchain,
			hash: this.transaction.hash,
			result: this.resultExtractor?.(receipt),
		}
	}

	getTxLink() {
		switch (this.network) {
			case "mainnet":
				return `https://etherscan.io/tx/${this.hash()}`
			case "mumbai":
				return `https://mumbai.polygonscan.com/tx/${this.hash()}`
			case "polygon":
				return `https://polygonscan.com/tx/${this.hash()}`
			case "testnet":
				return `https://rinkeby.etherscan.io/tx/${this.hash()}`
			default:
				throw new Error("Unsupported transaction network")
		}
	}

	get isEmpty(): boolean {
		return false
	}
}
