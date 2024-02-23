import type {
	AbstractConnectionProvider,
	ConnectionProvider,
	EthereumProviderConnectionResult,
} from "@rarible/connector"
import { EthereumWallet } from "@rarible/sdk-wallet"
import { Web3Ethereum, Web3 } from "@rarible/web3-ethereum"
import type { EVMBlockchain } from "@rarible/sdk-common"
import { getBlockchainFromChainId } from "@rarible/protocol-ethereum-sdk/build/common"
import { Web3v4Ethereum, Web3 as Web3v4 } from "@rarible/web3-v4-ethereum"
import type { IWalletAndAddress } from "./wallet-connection"

/**
 * Use this function for wrapping web3 v1 instance
 * If you need to use web3 v4 use "mapEthereumWeb3v4Wallet" function
 */
export function mapEthereumWallet<O>(
	provider: AbstractConnectionProvider<O, EthereumProviderConnectionResult>
): ConnectionProvider<O, IWalletAndAddress> {
	return provider.map(state => {
		const blockchain = getEvmBlockchain(state.chainId)
		let web3: Web3 = new Web3(state.provider)

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

export function mapEthereumWeb3v4Wallet<O>(
	provider: AbstractConnectionProvider<O, EthereumProviderConnectionResult>
): ConnectionProvider<O, IWalletAndAddress> {
	return provider.map(state => {
		const blockchain = getEvmBlockchain(state.chainId)
		let web3: Web3v4 = new Web3v4(state.provider)
		web3.setConfig({ defaultTransactionType: undefined })

		return {
			wallet: new EthereumWallet(
				new Web3v4Ethereum({
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
	return getBlockchainFromChainId(chainId)
}
