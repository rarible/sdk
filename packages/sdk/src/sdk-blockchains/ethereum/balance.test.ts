import { Web3Ethereum } from "@rarible/web3-ethereum"
import { EthereumWallet } from "@rarible/sdk-wallet"
import { toUnionAddress } from "@rarible/types"
import { awaitAll } from "@rarible/ethereum-sdk-test-common"
import { deployTestErc20 } from "@rarible/protocol-ethereum-sdk/build/order/contracts/test/test-erc20"
import { delay } from "@rarible/protocol-ethereum-sdk/build/common/retry"
import { createRaribleSdk } from "../../index"
import { initProviders } from "./test/init-providers"

describe("get balance", () => {
	const { web31, wallet1 } = initProviders({})

	const senderEthereum = new Web3Ethereum({ web3: web31 })
	const sdk = createRaribleSdk(new EthereumWallet(senderEthereum, toUnionAddress(`ETHEREUM:${wallet1.getAddressString()}`)), "e2e")

	const it = awaitAll({
		testErc20: deployTestErc20(web31, "Test1", "TST1"),
	})

	test("get balance erc-20", async () => {
		const sender = await senderEthereum.getFrom()
		await it.testErc20.methods.mint(sender, 1).send({ from: sender, gas: 200000 })

		await delay(500)
		const balance = await sdk.balances.getBalance(toUnionAddress(`ETHEREUM:${sender}`), {
			"@type": "ERC20",
			contract: toUnionAddress(`ETHEREUM:${it.testErc20.options.address}`),
		})
		expect(balance.toString()).toBe("0.000000000000000001")
	})
})
