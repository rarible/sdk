import { Web3Ethereum } from "@rarible/web3-ethereum"
import { EthereumWallet, FlowWallet, SolanaWallet } from "@rarible/sdk-wallet"
import fcl from "@onflow/fcl"
import { createRaribleSdk } from "../index"
import { initProviders } from "../sdk-blockchains/ethereum/test/init-providers"
import { LogsLevel } from "../domain"
import { getWallet } from "../sdk-blockchains/solana/common/test/test-wallets"
import { createTestWallet } from "../sdk-blockchains/tezos/test/test-wallet"

const providers = [{
	name: "Ethereum Wallet",
	getProvider: () => {
		const { web31 } = initProviders()
		const ethereum1 = new Web3Ethereum({ web3: web31 })
		return new EthereumWallet(ethereum1)
	},
}, {
	name: "Ethereum Provider",
	getProvider: () => {
		const { web31 } = initProviders()
		return new Web3Ethereum({ web3: web31 })
	},
}, {
	name: "Web3",
	getProvider: () => {
		const { web31 } = initProviders()
		return web31
	},
}, {
	name: "Solana Wallet",
	getProvider: () => {
		return new SolanaWallet(getWallet())
	},
}, {
	name: "Solana Provider",
	getProvider: () => {
		return getWallet()
	},
}, {
	name: "Tezos Wallet",
	getProvider: () => {
		return createTestWallet("edsk3UUamwmemNBJgDvS8jXCgKsvjL2NoTwYRFpGSRPut4Hmfs6dG8")
	},
}, {
	name: "Tezos Provider",
	getProvider: () => {
		return createTestWallet("edsk3UUamwmemNBJgDvS8jXCgKsvjL2NoTwYRFpGSRPut4Hmfs6dG8")
	},
}, {
	name: "Flow Wallet",
	getProvider: () => {
		return new FlowWallet(fcl)
	},
}, {
	name: "Flow Provider",
	getProvider: () => {
		return fcl
	},
}]

describe.each(providers)("Create Union SDK via $name", (suite) => {
	const provider = suite.getProvider()
	test("Should create SDK", () => {
		const sdk = createRaribleSdk(provider, "development", { logs: LogsLevel.DISABLED })
		expect(sdk.wallet).toBeTruthy()
	})
})
