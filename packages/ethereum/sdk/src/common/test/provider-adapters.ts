import type Wallet from "ethereumjs-wallet"
import Web3 from "web3"
import { ethers } from "ethers"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import { EthersEthereum, EthersWeb3ProviderEthereum } from "@rarible/ethers-ethereum"

const testAdapterTypes = ["web3", "ethers", "ethersWeb3"] as const
type TestAdapterType = typeof testAdapterTypes[number]

type TestAdapterByType<T extends TestAdapterType> = {
	web3: Web3Ethereum,
	ethers: EthersEthereum,
	ethersWeb3: EthersWeb3ProviderEthereum,
}[T]

type TestAdapter<T extends TestAdapterType> = {
	type: T
	adapter: TestAdapterByType<T>
}

type TestAdaptersSuite = {
	cases: TestAdapter<TestAdapterType>[]
} & {
	[K in TestAdapterType]: TestAdapterByType<K>
}

export function createTestAdapters(provider: any, wallet: Wallet): TestAdaptersSuite {
	const web3Adapter: TestAdapter<"web3"> = {
		type: "web3",
		adapter: createTestWeb3Adapter(provider),
	}
	const ethersWeb3Provider = new ethers.providers.Web3Provider(provider)
	const ethersWeb3Adapter: TestAdapter<"ethersWeb3"> = {
		type: "ethersWeb3",
		adapter: new EthersWeb3ProviderEthereum(ethersWeb3Provider),
	}
	const ethersWallet = new ethers.Wallet(wallet.getPrivateKeyString(), ethersWeb3Provider)
	const ethersAdapter: TestAdapter<"ethers"> = {
		type: "ethers",
		adapter: new EthersEthereum(ethersWallet),
	}

	return {
		web3: web3Adapter.adapter,
		ethers: ethersAdapter.adapter,
		ethersWeb3: ethersWeb3Adapter.adapter,
		cases: [web3Adapter, ethersWeb3Adapter, ethersAdapter],
	}
}

export function createTestWeb3Adapter(provider: any): Web3Ethereum {
	const web3 = new Web3(provider)
	return new Web3Ethereum({ web3, gas: 2000000 })
}
