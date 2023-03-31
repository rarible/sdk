import Web3ProviderEngine from "web3-provider-engine"
import Wallet from "ethereumjs-wallet"
import { TestSubprovider } from "@rarible/test-provider"
//@ts-ignore
import RpcSubprovider from "web3-provider-engine/subproviders/rpc"
import { randomWord } from "@rarible/types"
import type { provider as Web3Provider } from "web3-core"

export function createE2eWallet(pk: string = randomWord()): Wallet {
	return new Wallet(Buffer.from(fixPK(pk), "hex"))
}

export function createE2eProvider(pk: string = randomWord(), config: {
	networkId: number
	rpcUrl: string
} = {
	networkId: 300500,
	rpcUrl: "https://dev-ethereum-node.rarible.com",
}) {
	const provider = new Web3ProviderEngine({ pollingInterval: 1000 })
	const wallet = createE2eWallet(pk)
	provider.addProvider(new TestSubprovider(wallet, { networkId: config.networkId, chainId: config.networkId }))
	provider.addProvider(new RpcSubprovider({ rpcUrl: config.rpcUrl }))

	beforeAll(() => provider.start())
	afterAll(() => provider.stop())

	return {
		provider: provider as Web3Provider,
		wallet,
	}
}

function fixPK(pk: string) {
	return pk.startsWith("0x") ? pk.substring(2) : pk
}
