import type {
	AbstractConnectionProvider,
	ConnectionProvider,
	EthereumProviderConnectionResult,
} from "@rarible/connector"
import { EthereumWallet } from "@rarible/sdk-wallet"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import Web3 from "web3"
import { Blockchain } from "@rarible/api-client"
import { estimate } from "@rarible/estimate-middleware"
import type { IWalletAndAddress } from "./wallet-connection"

export function mapEthereumWallet<O>(
	provider: AbstractConnectionProvider<O, EthereumProviderConnectionResult>
): ConnectionProvider<O, IWalletAndAddress> {
	return provider.map(state => {
		const blockchain = getEvmBlockchain(state.chainId)
		const web3 = blockchain === Blockchain.POLYGON ?
			new Web3(estimate(state.provider, { force: true, threshold: 1.1 })) :
			new Web3(estimate(state.provider))
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

function getEvmBlockchain(chainId: number): Blockchain.POLYGON | Blockchain.ETHEREUM {
	switch (chainId) {
		case 137: return Blockchain.POLYGON
		case 80001: return Blockchain.POLYGON
		case 300501: return Blockchain.POLYGON
		case 200501: return Blockchain.POLYGON
		default: return Blockchain.ETHEREUM
	}
}
