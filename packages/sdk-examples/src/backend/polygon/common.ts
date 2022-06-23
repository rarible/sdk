import { EthereumWallet } from "@rarible/sdk-wallet"
import HDWalletProvider from "@truffle/hdwallet-provider"
import Web3 from "web3"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import { estimate } from "@rarible/estimate-middleware"

export async function initWalletWeb3WithHDWalletWithEstimate(privateKey: string): Promise<EthereumWallet> {
	if (
		process.env["ETHEREUM_RPC_URL"] === undefined ||
		process.env["ETHEREUM_NETWORK_ID"] === undefined
	) {
		throw new Error("Provide ETHEREUM_RPC_URL, ETHEREUM_NETWORK_ID as environment variables!")
	}

	const provider = new HDWalletProvider(privateKey, process.env["ETHEREUM_RPC_URL"])

	const web3 = new Web3(estimate(provider, {threshold: 1.1, estimation: process.env["ETHEREUM_RPC_URL"]}))

	const web3Ethereum = new Web3Ethereum({ web3 })

	return new EthereumWallet(web3Ethereum)
}
