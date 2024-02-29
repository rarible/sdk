import type { Blockchain } from "@rarible/api-client"
import type { EthereumTransaction } from "@rarible/ethereum-provider"
import type { EthereumNetwork } from "@rarible/protocol-ethereum-sdk/build/types"
import { getBlockchainBySDKNetwork, getChainIdByNetwork } from "@rarible/protocol-ethereum-sdk/build/common"
import type { IBlockchainTransaction } from "../domain"

export class BlockchainEthereumTransaction<TransactionResult = undefined> implements IBlockchainTransaction<
Blockchain, TransactionResult
> {
	public blockchain: Blockchain
	public chainId: number

	constructor(
		public transaction: EthereumTransaction,
		public network: EthereumNetwork,
		public resultExtractor?: (getEvents: EthereumTransaction["getEvents"]) => Promise<TransactionResult | undefined>,
	) {
		this.blockchain = this.getBlockchain(network)
		this.chainId = getChainIdByNetwork(this.network)
	}

	hash = () => this.transaction.hash

	wait = async () => {
		await this.transaction.wait()

		return {
			blockchain: this.blockchain,
			hash: this.transaction.hash,
			events: await this.transaction.getEvents(),
			result: await this.resultExtractor?.(this.transaction.getEvents.bind(this.transaction)),
		}
	}

	getTxLink = () => {
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
			case "zksync":
				return `https://explorer.zksync.io/tx/${this.hash()}`
			case "testnet-zksync":
				return `https://sepolia.explorer.zksync.io/tx/${this.hash()}`
			case "chiliz":
				return `https://scan.chiliz.com/tx/${this.hash()}`
			case "testnet-chiliz":
				return `https://spicy-explorer.chiliz.com/tx/${this.hash()}`
			case "lightlink":
				return `https://phoenix.lightlink.io/tx/${this.hash()}`
			case "testnet-lightlink":
				return `https://pegasus.lightlink.io/tx/${this.hash()}`
			case "rari":
				return `https://rari.calderaexplorer.xyz/tx/${this.hash()}`
			case "testnet-rari":
				return `https://rari-testnet.calderaexplorer.xyz/tx/${this.hash()}`
			case "base":
				return `https://basescan.org/tx/${this.hash()}`
			case "base-sepolia":
				return `https://base-sepolia.blockscout.com/tx/${this.hash()}`
			case "dev-ethereum":
				return `http://ethereum-explorer.dev.rarible.int/transactions/${this.hash()}`
			case "dev-polygon":
				return `http://polygon-explorer.dev.rarible.int/transactions/${this.hash()}`
			case "zkatana":
				return `https://zkatana.blockscout.com/tx/${this.hash()}`
			case "astar":
				return `https://astar.blockscout.com/tx/${this.hash()}`
			case "testnet-fief":
				return `https://explorer.playground.fiefdom.gg/tx/${this.hash()}`
			case "testnet-xai":
				return `https://testnet-explorer-v2.xai-chain.net/tx/${this.hash()}`
			case "xai":
				return `https://explorer.xai-chain.net/tx/${this.hash()}`
			case "testnet-celo":
				return `https://explorer.celo.org/alfajores/tx/${this.hash()}`
			case "celo":
				return `https://explorer.celo.org/mainnet/tx/${this.hash()}`
			case "testnet-kroma":
				return `https://blockscout.sepolia.kroma.network/tx/${this.hash()}`
			case "kroma":
				return `https://blockscout.kroma.network/tx/${this.hash()}`
			default:
				throw new Error("Unsupported transaction network")
		}
	}

	get isEmpty(): boolean {
  		return false
	}

	private getBlockchain(network: EthereumNetwork): Blockchain {
		return getBlockchainBySDKNetwork(network)
  	}
}
