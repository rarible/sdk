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
