import { createE2eProvider } from "@rarible/ethereum-sdk-test-common"
import Web3 from "web3"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import { toAddress } from "@rarible/types"
import { createRaribleSdk } from "../index"
import type { EthereumNetwork } from "../types"
import { ethereumNetworks } from "../types"
import { Balances } from "./balances"
import { createEthereumApis } from "./apis"
import { getTestAPIKey } from "./test/test-credentials"
import { getNetworkFromChainId } from "./index"

const randomEvmAddress = toAddress("0xE0c03F1a1a930331D88DaBEd59dc4Ae6d63DDEAD")

describe("getBalance test", () => {
	const { provider } = createE2eProvider()
	const web3 = new Web3(provider)
	const ethereum = new Web3Ethereum({ web3 })

	const getApis = async () => {
		const chainId = await ethereum.getChainId()
		const env = getNetworkFromChainId(chainId)
		return createEthereumApis(env)
	}

	const balances = new Balances(getApis)
	const testErc20Address = toAddress("0xa03C1eCaEB1D8A7581FC38d28f67c3d42a8B9b76")

	test.concurrent("get eth balance", async () => {
		const balance = await balances.getBalance(randomEvmAddress, { assetClass: "ETH" })
		expect(balance.toString()).toBe("0")
	})

	// test.concurrent("get non-zero eth balance", async () => {
	// 	@todo here we should:
	// 	1. deploy new erc20
	// 	2. mint tokens to new user
	// 	3. check the balance api
	// })

	test.concurrent("get erc-20 balance", async () => {
		const balance = await balances.getBalance(randomEvmAddress, {
			assetClass: "ERC20",
			contract: testErc20Address,
		})
		expect(balance.toString()).toBe("0")
	})

})

describe.each(ethereumNetworks)("get balances each of environments", (env: EthereumNetwork) => {
	const sdk = createRaribleSdk(undefined, env, {
		apiKey: getTestAPIKey(env),
	})

	test(`get balance on ${env}`, async () => {
		const value = await sdk.balances.getBalance(randomEvmAddress, { assetClass: "ETH" })
		expect(value.toNumber()).toEqual(0)
	})
})
