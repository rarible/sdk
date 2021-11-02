import { awaitAll } from "@rarible/ethereum-sdk-test-common"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import { EthereumWallet } from "@rarible/sdk-wallet"
import { toItemId, toUnionAddress } from "@rarible/types"
import { deployTestErc20 } from "@rarible/protocol-ethereum-sdk/build/order/contracts/test/test-erc20"
import { deployTestErc721 } from "@rarible/protocol-ethereum-sdk/build/order/contracts/test/test-erc721"
import { createRaribleSdk } from "../../index"
import { initProviders } from "./test/init-providers"
import { awaitStockToBe } from "./test/await-stock-to-be"
import { awaitItem } from "./test/await-item"

describe("sale", () => {

	const { web31, web32, wallet1, wallet2 } = initProviders({})

	const ethereum1 = new Web3Ethereum({ web3: web31 })
	const ethereum2 = new Web3Ethereum({ web3: web32 })
	const sdk1 = createRaribleSdk(new EthereumWallet(ethereum1, toUnionAddress(`ETHEREUM:${wallet1.getAddressString()}`)), "e2e")
	const sdk2 = createRaribleSdk(new EthereumWallet(ethereum2, toUnionAddress(`ETHEREUM:${wallet2.getAddressString()}`)), "e2e")

	const conf = awaitAll({
		testErc20: deployTestErc20(web31, "Test1", "TST1"),
		testErc721: deployTestErc721(web31, "Test2", "TST2"),
	})

	test("erc721 sell/buy using erc-20", async () => {
		const wallet1Address = wallet1.getAddressString()
		const wallet2Address = wallet2.getAddressString()
		await conf.testErc721.methods.mint(wallet1Address, 1, "").send({ from: wallet1Address, gas: 200000 })
		await conf.testErc20.methods.mint(wallet2Address, 100).send({ from: wallet1Address, gas: 200000 })
		const itemId = toItemId(`ETHEREUM:${conf.testErc721.options.address}:1`)

		await awaitItem(sdk1, itemId)

		const sellAction = await sdk1.order.sell({ itemId })
		const orderId = await sellAction.submit({
			amount: 1,
			price: "0.000000000000000002",
			currency: { "@type": "ERC20", contract: toUnionAddress(`ETHEREUM:${conf.testErc20.options.address}`) },
		})

		await awaitStockToBe(sdk1, orderId, 1)
		const updateAction = await sdk1.order.sellUpdate({ orderId })
		await updateAction.submit({ price: "0.000000000000000001" })

		await sdk1.apis.order.getOrderById({ id: orderId })

		const fillAction = await sdk2.order.fill({ orderId })

		const tx = await fillAction.submit({ amount: 1 })
		await tx.wait()

		await awaitStockToBe(sdk1, orderId, 0)
	})
})
