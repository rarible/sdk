import { Web3Ethereum } from "@rarible/web3-ethereum"
import { EthereumWallet } from "@rarible/sdk-wallet"
import { createRaribleSdk } from "@rarible/protocol-ethereum-sdk"
import { awaitAll } from "@rarible/ethereum-sdk-test-common"
import { deployTestErc20 } from "@rarible/protocol-ethereum-sdk/build/order/contracts/test/test-erc20"
import { deployTestErc721 } from "@rarible/protocol-ethereum-sdk/build/order/contracts/test/test-erc721"
import { toItemId, toUnionAddress } from "@rarible/types"
import { initProviders } from "./test/init-providers"
import { awaitItem } from "./test/await-item"
import { awaitStockToBe } from "./test/await-stock-to-be"
import { createEthereumSdk } from "./index"

describe("bid", () => {

	const { web31, wallet1 } = initProviders({})

	const senderEthereum = new Web3Ethereum({ web3: web31 })
	const senderSdk = createEthereumSdk(new EthereumWallet(senderEthereum, toUnionAddress(wallet1.getAddressString())), "e2e")

	const raribleSdk = createRaribleSdk(senderEthereum, "e2e")

	const it = awaitAll({
		testErc20: deployTestErc20(web31, "Test1", "TST1"),
		testErc721: deployTestErc721(web31, "Test2", "TST2"),
	})

	test("bid on erc721", async () => {
		const sender = await senderEthereum.getFrom()

		const tokenId = "1"
		const itemId = toItemId(`${it.testErc721.options.address}:${tokenId}`)
		await it.testErc721.methods.mint(sender, tokenId, "123").send({ from: sender, gas: 500000 })
		await it.testErc20.methods.mint(sender, 100).send({ from: sender, gas: 500000 })

		await awaitItem(raribleSdk, itemId)

		const response = await senderSdk.order.bid({ itemId })
		const orderId = await response.submit({
			amount: 1,
			price: "0.000000000000000001",
			currency: { "@type": "ERC20", contract: toUnionAddress(it.testErc20.options.address) },
		})

		const [,hash] = orderId.split(":")
		await awaitStockToBe(raribleSdk, hash, 1)
	})

})
