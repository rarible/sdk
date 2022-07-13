import { awaitAll, deployTestErc20, deployTestErc721 } from "@rarible/ethereum-sdk-test-common"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import { EthereumWallet } from "@rarible/sdk-wallet"
import { toContractAddress, toItemId } from "@rarible/types"
import { createRaribleSdk } from "../../index"
import { LogsLevel } from "../../domain"
import { initProviders } from "./test/init-providers"
import { awaitStock } from "./test/await-stock"
import { awaitItem } from "./test/await-item"
import { awaitOrderCancel } from "./test/await-order-cancel"

describe.skip("cancel", () => {
	const { web31, wallet1 } = initProviders()
	const ethereum1 = new Web3Ethereum({ web3: web31 })
	const ethereumWallet = new EthereumWallet(ethereum1)
	const sdk1 = createRaribleSdk(ethereumWallet, "development", { logs: LogsLevel.DISABLED })

	const conf = awaitAll({
		testErc20: deployTestErc20(web31, "Test1", "TST1"),
		testErc721: deployTestErc721(web31, "Test2", "TST2"),
	})

	test("sell and cancel", async () => {
		const senderRaw = wallet1.getAddressString()
		await conf.testErc721.methods.mint(senderRaw, 1, "").send({
			from: senderRaw,
			gas: 200000,
		})
		const itemId = toItemId(`ETHEREUM:${conf.testErc721.options.address}:1`)

		await awaitItem(sdk1, itemId)

		const sellAction = await sdk1.order.sell({ itemId })
		const orderId = await sellAction.submit({
			amount: 1,
			price: "0.000000000000000002",
			currency: {
				"@type": "ERC20",
				contract: toContractAddress(`ETHEREUM:${conf.testErc20.options.address}`),
			},
		})

		const nextStock = "1"
		const order = await awaitStock(sdk1, orderId, nextStock)
		expect(order.makeStock.toString()).toEqual(nextStock)

		const tx = await sdk1.order.cancel.start({ orderId }).runAll()
		await tx.wait()

		const cancelledOrder = await awaitOrderCancel(sdk1, orderId)
		expect(cancelledOrder.cancelled).toEqual(true)
	})
})
