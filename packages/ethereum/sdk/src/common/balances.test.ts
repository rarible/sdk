import { createE2eProvider } from "@rarible/ethereum-sdk-test-common"
import Web3 from "web3"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import { toAddress } from "@rarible/types"
import { configDictionary } from "../config"
import { createRaribleSdk } from "../index"
import type { EthereumNetwork } from "../types"
import { Balances } from "./balances"
import { createEthereumApis } from "./apis"
import { getAPIKey } from "./test/test-credentials"
import { getNetworkFromChainId } from "./index"

describe("getBalance test", () => {
	const pk = "d519f025ae44644867ee8384890c4a0b8a7b00ef844e8d64c566c0ac971c9469"
	const { provider } = createE2eProvider(pk)
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
		const senderAddress = toAddress(await ethereum.getFrom())
		const balance = await balances.getBalance(senderAddress, { assetClass: "ETH" })
		expect(balance.toString()).toBe("0")
	})

	test.concurrent("get non-zero eth balance", async () => {
		const senderAddress = toAddress("0xa14FC5C72222FAce8A1BcFb416aE2571fA1a7a91")
		const balance = await balances.getBalance(senderAddress, { assetClass: "ETH" })
		expect(balance.toString()).toBe("1.9355")
	})

	test.concurrent("get erc-20 balance", async () => {
		const senderAddress = toAddress(await ethereum.getFrom())

		const nextBalance = "0.000000000000000001"

		const balance = await balances.getBalance(senderAddress, {
			assetClass: "ERC20",
			contract: testErc20Address,
		})
		if (balance.toString() !== nextBalance) {
			throw new Error("Unequal balances")
		}
		expect(balance.toString()).toBe(nextBalance)
	})

})

const envs = (Object.keys(configDictionary) as EthereumNetwork[])


describe.each(envs)("get balances each of environments", (env: EthereumNetwork) => {
	const senderAddress = toAddress("0xc8f35463Ea36aEE234fe7EFB86373A78BF37e2A1")
	const sdk = createRaribleSdk(undefined, env, {
		apiKey: getAPIKey(env),
	})

	test(`get balance on ${env}`, async () => {
		await sdk.balances.getBalance(senderAddress, { assetClass: "ETH" })
	})
})
