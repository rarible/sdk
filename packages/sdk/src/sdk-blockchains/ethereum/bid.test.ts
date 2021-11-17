import { Web3Ethereum } from "@rarible/web3-ethereum"
import { EthereumWallet } from "@rarible/sdk-wallet"
import { awaitAll } from "@rarible/ethereum-sdk-test-common"
import { deployTestErc20 } from "@rarible/protocol-ethereum-sdk/build/order/contracts/test/test-erc20"
import { deployTestErc721 } from "@rarible/protocol-ethereum-sdk/build/order/contracts/test/test-erc721"
import { toContractAddress, toItemId, toOrderId, toUnionAddress } from "@rarible/types"
import { createRaribleSdk } from "../../index"
import { initProviders } from "./test/init-providers"
import { awaitItem } from "./test/await-item"
import { awaitStock } from "./test/await-stock"

describe("bid", () => {
	const { web31, wallet1 } = initProviders()

	const ethereum = new Web3Ethereum({ web3: web31 })
	const wallet = new EthereumWallet(ethereum)
	const sdk = createRaribleSdk(wallet, "e2e")

	const it = awaitAll({
		testErc20: deployTestErc20(web31, "Test1", "TST1"),
		testErc721: deployTestErc721(web31, "Test2", "TST2"),
	})

	test("bid on erc721 and update bid", async () => {
		const senderRaw = wallet1.getAddressString()

		const tokenId = "1"
		const itemId = toItemId(
			`ETHEREUM:${it.testErc721.options.address}:${tokenId}`
		)
		await it.testErc721.methods.mint(senderRaw, tokenId, "123").send({
			from: senderRaw,
			gas: 500000,
		})
		await it.testErc20.methods.mint(senderRaw, 100).send({
			from: senderRaw,
			gas: 500000,
		})

		await awaitItem(sdk, itemId)

		const response = await sdk.order.bid({ itemId })
		const price = "0.000000000000000002"
		const orderId = await response.submit({
			amount: 1,
			price,
			currency: {
				"@type": "ERC20",
				contract: toContractAddress(`ETHEREUM:${it.testErc20.options.address}`),
			},
		})

		const order = await awaitStock(sdk, orderId, price)
		expect(order.makeStock.toString()).toEqual(price)

		const updateAction = await sdk.order.bidUpdate({
			orderId: toOrderId(orderId),
		})
		await updateAction.submit({ price: "0.000000000000000004" })
	})
})
