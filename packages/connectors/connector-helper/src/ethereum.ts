import type {
	AbstractConnectionProvider,
	ConnectionProvider,
	EthereumProviderConnectionResult,
} from "@rarible/connector"
import { EthereumWallet } from "@rarible/sdk-wallet"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import Web3 from "web3"
import { Blockchain } from "@rarible/api-client"
import type { EVMBlockchain } from "@rarible/sdk-common"
import type { IWalletAndAddress } from "./wallet-connection"

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

function getEvmBlockchain(chainId: number): EVMBlockchain {
	switch (chainId) {
		case 137: return Blockchain.POLYGON
		case 80001: return Blockchain.POLYGON
		case 300501: return Blockchain.POLYGON
		case 200501: return Blockchain.POLYGON
		case 5000: return Blockchain.MANTLE
		case 5001: return Blockchain.MANTLE
		case 42161: return Blockchain.ARBITRUM
		case 421614: return Blockchain.ARBITRUM
		default: return Blockchain.ETHEREUM
	}
}
