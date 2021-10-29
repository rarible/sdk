import { Web3Ethereum } from "@rarible/web3-ethereum"
import { EthereumWallet } from "@rarible/sdk-wallet"
import { awaitAll } from "@rarible/ethereum-sdk-test-common"
import { deployTestErc20 } from "@rarible/protocol-ethereum-sdk/build/order/contracts/test/test-erc20"
import { deployTestErc721 } from "@rarible/protocol-ethereum-sdk/build/order/contracts/test/test-erc721"
import { toItemId, toOrderId, toUnionAddress } from "@rarible/types"
import { createRaribleSdk } from "../../index"
import { delay } from "@rarible/protocol-ethereum-sdk/build/common/retry"
import { initProviders } from "./test/init-providers"
import { awaitItem } from "./test/await-item"
import { awaitStockToBe } from "./test/await-stock-to-be"

describe("bid", () => {

	const { web31, wallet1 } = initProviders({})

	const senderEthereum = new Web3Ethereum({ web3: web31 })
	const sdk = createRaribleSdk(new EthereumWallet(senderEthereum, toUnionAddress(`ETHEREUM:${wallet1.getAddressString()}`)), "e2e")

	const it = awaitAll({
		testErc20: deployTestErc20(web31, "Test1", "TST1"),
		testErc721: deployTestErc721(web31, "Test2", "TST2"),
	})

	test("bid on erc721 and update bid", async () => {
		const sender = await senderEthereum.getFrom()

		const tokenId = "1"
		const itemId = toItemId(`ETHEREUM:${it.testErc721.options.address}:${tokenId}`)
		await it.testErc721.methods.mint(sender, tokenId, "123").send({ from: sender, gas: 500000 })
		await it.testErc20.methods.mint(sender, 100).send({ from: sender, gas: 500000 })

		await awaitItem(sdk, itemId)

		const response = await sdk.order.bid({ itemId })
		const orderId = await response.submit({
			amount: 1,
			price: "0.000000000000000002",
			currency: { "@type": "ERC20", contract: toUnionAddress(it.testErc20.options.address) },
		})

		await awaitStockToBe(sdk, orderId, "1e-18")

		// await delay(500)
		const updateAction = await sdk.order.bidUpdate({ orderId: toOrderId(orderId) })
		await updateAction.submit({ price: "0.000000000000000004" })
	})

})
