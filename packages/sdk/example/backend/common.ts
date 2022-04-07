import FormData from "form-data"
import fetch from "node-fetch"
import Web3ProviderEngine from "web3-provider-engine"
import Wallet from "ethereumjs-wallet"
import { TestSubprovider } from "@rarible/test-provider"
// @ts-ignore
import RpcSubprovider from "web3-provider-engine/subproviders/rpc"
import { EthereumWallet } from "@rarible/sdk-wallet"
import { ethers } from "ethers"
import { EthersEthereum } from "@rarible/ethers-ethereum"

export function updateNodeGlobalVars() {
	(global as any).FormData = FormData;
	(global as any).window = {
		fetch: fetch,
		dispatchEvent: () => {},
	};
	(global as any).CustomEvent = function CustomEvent() {
		return
	}
}
export function initNodeProvider(pk: string, config: { networkId: number, rpcUrl: string }) {
	const provider = new Web3ProviderEngine({ pollingInterval: 100 })
	const privateKey = pk.startsWith("0x") ? pk.substring(2) : pk
	const wallet = new Wallet(Buffer.from(privateKey, "hex"))
	provider.addProvider(new TestSubprovider(wallet, { networkId: config.networkId, chainId: config.networkId }))
	provider.addProvider(new RpcSubprovider({ rpcUrl: config.rpcUrl }))
	provider.start()
	return provider
}

export function initWallet(privateKey: string): EthereumWallet {
	if (
		process.env["ETHEREUM_RPC_URL"] === undefined ||
    process.env["ETHEREUM_NETWORK_ID"] === undefined
	) {
		throw new Error("Provide ETHEREUM_RPC_URL, ETHEREUM_NETWORK_ID as environment variables!")
	}
	const provider = initNodeProvider(privateKey, {
		rpcUrl: process.env["ETHEREUM_RPC_URL"],
		networkId: +process.env["ETHEREUM_NETWORK_ID"],
	})
	//@ts-ignore
	const raribleEthers = new ethers.providers.Web3Provider(provider)

	//@ts-ignore
	const raribleProvider = new EthersEthereum(new ethers.Wallet(privateKey, raribleEthers))
	return new EthereumWallet(raribleProvider)
}
