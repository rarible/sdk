import type { RaribleSdk } from "@rarible/protocol-ethereum-sdk"
import { createRaribleSdk } from "@rarible/protocol-ethereum-sdk"
import type { EthereumNetwork } from "@rarible/protocol-ethereum-sdk/build/types"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import Web3 from "web3"


export function getRpcUrl(blockchain: string) {
	return process.env[blockchain.toUpperCase() + "_RPC_URL"]
}

export function getSdkEnv(blockchain: string) {
	return process.env[blockchain.toUpperCase() + "_SDK_ENV"]
}

export function getRaribleSDK(blockchain: string, from: string): RaribleSdk {
	const web3Provider = new Web3(new Web3.providers.HttpProvider(getRpcUrl(blockchain)))
	const web3Ethereum = new Web3Ethereum({ web3: web3Provider, from })
	return createRaribleSdk(web3Ethereum, getSdkEnv(blockchain) as EthereumNetwork, {
		apiClientParams: {
			fetchApi: fetch,
			basePath: process.env.RARIBLE_BASE_PATH,
		},
		apiKey: process.env.RARIBLE_API_KEY,
	})
}

export function getAddressParts(address: string): { blockchain: string, address: string } {
	const parts = address.split(":")

	return {
		blockchain: parts[0],
		address: parts[1],
	}
}
