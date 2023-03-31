import { awaitAll, createE2eProvider, deployTestErc20 } from "@rarible/ethereum-sdk-test-common"
import Web3 from "web3"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import { toAddress } from "@rarible/types"
import { configDictionary } from "../config"
import { createRaribleSdk } from "../index"
import type { EthereumNetwork } from "../types"
import { Balances } from "./balances"
import { retry } from "./retry"
import { createEthereumApis } from "./apis"

describe("getBalance test", () => {
	const pk = "d519f025ae44644867ee8384890c4a0b8a7b00ef844e8d64c566c0ac971c9469"
	const { provider } = createE2eProvider(pk)
	const web3 = new Web3(provider)
	const ethereum = new Web3Ethereum({ web3 })

	const apis = createEthereumApis("dev-ethereum")

	const balances = new Balances(apis)

	const it = awaitAll({
		testErc20: deployTestErc20(web3, "Test1", "TST1"),
	})

	test("get eth balance", async () => {
		const senderAddress = toAddress(await ethereum.getFrom())
		const balance = await balances.getBalance(senderAddress, { assetClass: "ETH" })
		expect(balance.toString()).toBe("0")
	})

	test("get non-zero eth balance", async () => {
		const senderAddress = toAddress("0xa14FC5C72222FAce8A1BcFb416aE2571fA1a7a91")
		const balance = await balances.getBalance(senderAddress, { assetClass: "ETH" })
		expect(balance.toString()).toBe("1.9355")
	})

	test.skip("get erc-20 balance", async () => {
		const senderAddress = toAddress(await ethereum.getFrom())
		await it.testErc20.methods.mint(senderAddress, 1).send({
			from: senderAddress,
			gas: 200000,
		})

		const nextBalance = "0.000000000000000001"
		const balance = await retry(10, 4000, async () => {
			const balance = await balances.getBalance(senderAddress, {
				assetClass: "ERC20",
				contract: toAddress(it.testErc20.options.address),
			})
			if (balance.toString() !== nextBalance) {
				throw new Error("Unequal balances")
			}
			return balance
		})

		expect(balance.toString()).toBe(nextBalance)
	})

})

const envs = Object.keys(configDictionary) as EthereumNetwork[]

describe.each(envs)("get balances each of environments", (env: EthereumNetwork) => {
	const senderAddress = toAddress("0xc8f35463Ea36aEE234fe7EFB86373A78BF37e2A1")
	const sdk = createRaribleSdk(undefined, env)

	test(`get balance on ${env}`, async () => {
		const balance = await sdk.balances.getBalance(senderAddress, { assetClass: "ETH" })
		console.log("balance", env, balance.toString())
	})
})
