import { Web3Ethereum } from "@rarible/web3-ethereum"
import { EthereumWallet } from "@rarible/sdk-wallet"
import { toContractAddress, toUnionAddress } from "@rarible/types"
import { awaitAll, deployTestErc20 } from "@rarible/ethereum-sdk-test-common"
import { Blockchain } from "@rarible/api-client"
import { createRaribleSdk } from "../../index"
import { retry } from "../../common/retry"
import { LogsLevel } from "../../domain"
import { initProviders } from "./test/init-providers"

describe("get balance", () => {
	const { web31, wallet1 } = initProviders()

	const ethereum = new Web3Ethereum({
		web3: web31,
		from: wallet1.getAddressString(),
	})
	const sdk = createRaribleSdk(new EthereumWallet(ethereum, Blockchain.ETHEREUM), "e2e", { logs: LogsLevel.DISABLED })

	const it = awaitAll({
		testErc20: deployTestErc20(web31, "Test1", "TST1"),
	})

	test("get ETH balance with wallet", async () => {
		const walletAddress = toUnionAddress("ETHEREUM:0xa14FC5C72222FAce8A1BcFb416aE2571fA1a7a91")
		const balance = await sdk.balances.getBalance(walletAddress, {
			"@type": "ETH",
		})
		expect(balance.toString()).toEqual("1.9355")
	})

	test("get ETH balance without wallet", async () => {
		const sdk = createRaribleSdk(undefined, "e2e", { logs: LogsLevel.DISABLED })
		const walletAddress = toUnionAddress("ETHEREUM:0xa14FC5C72222FAce8A1BcFb416aE2571fA1a7a91")
		const balance = await sdk.balances.getBalance(walletAddress, {
			"@type": "ETH",
		})
		expect(balance.toString()).toEqual("1.9355")
	})

	test("get balance erc-20", async () => {
		expect.assertions(1)
		const senderRaw = wallet1.getAddressString()
		const sender = toUnionAddress(`ETHEREUM:${senderRaw}`)
		await it.testErc20.methods.mint(senderRaw, 1).send({
			from: senderRaw,
			gas: 200000,
		})

		const contract = toContractAddress(`ETHEREUM:${it.testErc20.options.address}`)
		const nextBalance = "0.000000000000000001"
		const balance = await retry(5, 1000, async () => {
			const balance = await sdk.balances.getBalance(sender, {
				"@type": "ERC20",
				contract,
			})
			if (balance.toString() !== nextBalance) {
				throw new Error("Unequal balances")
			}
			return balance
		})

		expect(balance.toString()).toEqual(nextBalance)
	})
})

describe("get polygon balance", () => {
	const sdk = createRaribleSdk(undefined, "staging", { logs: LogsLevel.DISABLED })

	test("get Matic balance", async () => {
		const walletAddress = toUnionAddress("ETHEREUM:0xc8f35463Ea36aEE234fe7EFB86373A78BF37e2A1")
		const balance = await sdk.balances.getBalance(walletAddress, {
			"@type": "ETH",
			blockchain: Blockchain.POLYGON,
		})
		expect(balance.toString()).toEqual("0.009145")
	})

})
