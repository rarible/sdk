import type {
	AbstractConnectionProvider,
	ConnectionProvider,
	EthereumProviderConnectionResult,
} from "@rarible/connector"
import { EthereumWallet } from "@rarible/sdk-wallet"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import Web3 from "web3"
import type { EVMBlockchain } from "@rarible/sdk-common"
import { configDictionary } from "@rarible/protocol-ethereum-sdk/build/config"
import { BlockchainEthereumTransaction } from "@rarible/sdk-transaction"
import type { EthereumNetwork } from "@rarible/protocol-ethereum-sdk/build/types"
import type { IWalletAndAddress } from "./wallet-connection"

export function mapEthereumWallet<O>(
	provider: AbstractConnectionProvider<O, EthereumProviderConnectionResult>
): ConnectionProvider<O, IWalletAndAddress> {
	return provider.map(state => {
		const blockchain = getEvmBlockchain(state.chainId)
		let web3: Web3 = new Web3(state.provider)

		console.log("block", blockchain, state.chainId)
		return {
			wallet: new EthereumWallet(
				new Web3Ethereum({
					web3,
					from: state.address,
				})
			),
			address: state.address,
			blockchain,
		}
	})
}

function getEvmBlockchain(chainId: number): EVMBlockchain {
	for (const [evmSDKNetwork, config] of Object.entries(configDictionary)) {
		if (config.chainId === chainId) {
			return BlockchainEthereumTransaction.getBlockchain(evmSDKNetwork as EthereumNetwork) as EVMBlockchain
		}
	}
	throw new Error(`ChainID=${chainId} is not recognized`)
}
