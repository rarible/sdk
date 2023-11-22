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
		public resultExtractor?: (getEvents: EthereumTransaction["getEvents"]) => Promise<TransactionResult | undefined>,
	) {
		this.blockchain = this.getBlockchain(network)
	}

	private getBlockchain(network: EthereumNetwork): Blockchain {
		switch (network) {
			case "mumbai":
			case "polygon":
				return Blockchain.POLYGON
			case "mantle":
			case "testnet-mantle":
				return Blockchain.MANTLE
			default:
				return Blockchain.ETHEREUM
		}
	}

	hash() {
		return this.transaction.hash
	}

	async wait() {
		await this.transaction.wait()

		return {
			blockchain: this.blockchain,
			hash: this.transaction.hash,
			events: await this.transaction.getEvents(),
			result: await this.resultExtractor?.(this.transaction.getEvents.bind(this.transaction)),
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
				return `https://goerli.etherscan.io/tx/${this.hash()}`
			case "mantle":
				return `https://explorer.mantle.xyz/tx/${this.hash()}`
			case "testnet-mantle":
				return `https://explorer.testnet.mantle.xyz/tx/${this.hash()}`
			case "arbitrum":
				return `https://arbiscan.io/tx/${this.hash()}`
			case "testnet-arbitrum":
				return `https://sepolia.arbiscan.io/tx/${this.hash()}`
			default:
				throw new Error("Unsupported transaction network")
		}
	}

	get isEmpty(): boolean {
		return false
	}
}
