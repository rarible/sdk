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
import Web3 from "web3"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import HDWalletProvider from "@truffle/hdwallet-provider"


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

export async function initWallet(privateKey: string): Promise<EthereumWallet> {
	if (
		process.env["ETHEREUM_RPC_URL"] === undefined ||
    process.env["ETHEREUM_NETWORK_ID"] === undefined
	) {
		throw new Error("Provide ETHEREUM_RPC_URL, ETHEREUM_NETWORK_ID as environment variables!")
	}
	const raribleEthers = new ethers.providers.JsonRpcProvider(process.env["ETHEREUM_RPC_URL"])

	const raribleProvider = new EthersEthereum(new ethers.Wallet(privateKey, raribleEthers))
	return new EthereumWallet(raribleProvider)
}

export async function initWalletWeb3(privateKey: string): Promise<EthereumWallet> {
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

	const web3 = new Web3(provider)

	const web3Ethereum = new Web3Ethereum({ web3 })

	return new EthereumWallet(web3Ethereum)
}

export async function initWalletWeb3WithHDWallet(privateKey: string): Promise<EthereumWallet> {
	if (
		process.env["ETHEREUM_RPC_URL"] === undefined ||
    process.env["ETHEREUM_NETWORK_ID"] === undefined
	) {
		throw new Error("Provide ETHEREUM_RPC_URL, ETHEREUM_NETWORK_ID as environment variables!")
	}

	const provider = new HDWalletProvider(privateKey, process.env["ETHEREUM_RPC_URL"])

	const web3 = new Web3(provider)

	const web3Ethereum = new Web3Ethereum({ web3 })

	return new EthereumWallet(web3Ethereum)
}
