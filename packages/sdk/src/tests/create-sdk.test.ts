import { ethers } from "ethers"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import { EthereumWallet, FlowWallet, SolanaWallet } from "@rarible/sdk-wallet"
import { BlockchainGroup } from "@rarible/api-client/build/models/BlockchainGroup"
import * as fcl from "@onflow/fcl"
import { initProviders } from "../sdk-blockchains/ethereum/test/init-providers"
import { getWallet } from "../sdk-blockchains/solana/common/test/test-wallets"
import { createTestWallet } from "../sdk-blockchains/tezos/test/test-wallet"
import { createSdk } from "../common/test/create-sdk"

const { web31, web32 } = initProviders()

const providers = [{
	name: "Ethereum Wallet",
	getProvider: () => {
		const ethereum1 = new Web3Ethereum({ web3: web31 })
		return new EthereumWallet(ethereum1)
	},
	expectedBlockchain: BlockchainGroup.ETHEREUM,
}, {
	name: "Ethereum Provider",
	getProvider: () => {
		return new Web3Ethereum({ web3: web32 })
	},
	expectedBlockchain: BlockchainGroup.ETHEREUM,
}, {
	name: "Web3",
	getProvider: () => {
		return web31
	},
	expectedBlockchain: BlockchainGroup.ETHEREUM,
}, {
	name: "Ethers",
	getProvider: () => {
		const provider = new ethers.providers.JsonRpcProvider("https://dev-ethereum-node.rarible.com")
		return new ethers.Wallet("ded057615d97f0f1c751ea2795bc4b03bbf44844c13ab4f5e6fd976506c276b9", provider)
	},
	expectedBlockchain: BlockchainGroup.ETHEREUM,
}, {
	name: "Solana Wallet",
	getProvider: () => {
		return new SolanaWallet(getWallet())
	},
	expectedBlockchain: BlockchainGroup.SOLANA,
}, {
	name: "Solana Provider",
	getProvider: () => {
		return getWallet()
	},
	expectedBlockchain: BlockchainGroup.SOLANA,
}, {
	name: "Tezos Wallet",
	getProvider: () => {
		return createTestWallet("edsk3UUamwmemNBJgDvS8jXCgKsvjL2NoTwYRFpGSRPut4Hmfs6dG8", "development")
	},
	expectedBlockchain: BlockchainGroup.TEZOS,
}, {
	name: "Flow Wallet",
	getProvider: () => {
		return new FlowWallet(fcl)
	},
	expectedBlockchain: BlockchainGroup.FLOW,
}, {
	name: "Flow Provider",
	getProvider: () => {
		return fcl
	},
	expectedBlockchain: BlockchainGroup.FLOW,
}]

describe.each(providers)("Create Union SDK via $name", (suite) => {
	const provider = suite.getProvider()
	test("Should create SDK", () => {
		const sdk = createSdk(provider, "development")
		expect(sdk.wallet).toBeTruthy()
		expect(sdk.wallet?.walletType).toEqual(suite.expectedBlockchain)
	})
})
