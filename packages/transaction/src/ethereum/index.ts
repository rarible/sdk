import { Blockchain } from "@rarible/api-client"
import type { EthereumTransaction } from "@rarible/ethereum-provider"
import type { EthereumNetwork } from "@rarible/protocol-ethereum-sdk/build/types"
import type { IBlockchainTransaction } from "../domain"

export class BlockchainEthereumTransaction implements IBlockchainTransaction {
	blockchain: Blockchain

	constructor(public transaction: EthereumTransaction, public network: EthereumNetwork) {
		this.blockchain = this.getBlockchain(network)
	}

	private getBlockchain(network: EthereumNetwork): Blockchain {
		switch (network) {
			case "mumbai":
			case "mumbai-dev":
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
		await this.transaction.wait()

		return {
			blockchain: this.blockchain,
			hash: this.transaction.hash,
		}
	}

	getTxLink() {
		switch (this.network) {
			case "mainnet": return `https://etherscan.io/tx/${this.hash()}`
			case "mumbai": return `https://mumbai.polygonscan.com/tx/${this.hash()}`
			case "polygon": return `https://polygonscan.com/tx/${this.hash()}`
			case "ropsten": return `https://ropsten.etherscan.io/tx/${this.hash()}`
			case "rinkeby": return `https://rinkeby.etherscan.io/tx/${this.hash()}`
			case "testnet": return `https://rinkeby.etherscan.io/tx/${this.hash()}`
			default: throw new Error("Unsupported transaction network")
		}
	}
}
