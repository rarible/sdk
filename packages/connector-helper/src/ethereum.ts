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

const polygonRpcMap = {
	137: "https://polygon-rpc.com",
	80001: "https://matic-mumbai.chainstacklabs.com",
	300501: "https://dev-polygon-node.rarible.com",
	200501: "",
}

export function mapEthereumWallet<O>(
	provider: AbstractConnectionProvider<O, EthereumProviderConnectionResult>
): ConnectionProvider<O, IWalletAndAddress> {
	return provider.map(state => {
		const blockchain = getEvmBlockchain(state.chainId)
		let web3: Web3
		provider.map(e => e.provider)
		if (blockchain === Blockchain.POLYGON) {
			if (state.chainId !== 137 && state.chainId !== 80001 && state.chainId !== 300501) {
				throw new Error("Wrong chain id")
			}
			web3 = new Web3(estimate(state.provider, { threshold: 1.1, estimation: polygonRpcMap[state.chainId] }))
		} else {
			web3 = new Web3(state.provider)
		}

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
