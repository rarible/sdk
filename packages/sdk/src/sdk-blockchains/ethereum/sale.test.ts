import { awaitAll } from "@rarible/ethereum-sdk-test-common"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import { EthereumWallet } from "@rarible/sdk-wallet/src"
import { toBigNumber, toItemId, toOrderId, toUnionAddress } from "@rarible/types"
import { createRaribleSdk } from "@rarible/protocol-ethereum-sdk"
import { deployTestErc20 } from "@rarible/protocol-ethereum-sdk/build/order/contracts/test/test-erc20"
import { deployTestErc721 } from "@rarible/protocol-ethereum-sdk/build/order/contracts/test/test-erc721"
import { initProviders } from "./test/init-providers"
import { awaitStockToBe } from "./test/await-stock-to-be"
import { awaitItem } from "./test/await-item"
import { createEthereumSdk } from "./index"

describe("sale", () => {

	const { web31, web32, wallet1, wallet2 } = initProviders({})

	const ethereum1 = new Web3Ethereum({ web3: web31 })
	const ethereum2 = new Web3Ethereum({ web3: web32 })
	const sdk1 = createEthereumSdk(new EthereumWallet(ethereum1, "e2e"))
	const sdk2 = createEthereumSdk(new EthereumWallet(ethereum2, "e2e"))
	const raribleSdk = createRaribleSdk(ethereum1, "e2e")

	const conf = awaitAll({
		testErc20: deployTestErc20(web31, "Test1", "TST1"),
		testErc721: deployTestErc721(web31, "Test2", "TST2"),
	})

	test("erc721 sell/buy using erc-20", async () => {
		const wallet1Address = wallet1.getAddressString()
		const wallet2Address = wallet2.getAddressString()
		await conf.testErc721.methods.mint(wallet1Address, 1, "").send({ from: wallet1Address, gas: 200000 })
		await conf.testErc20.methods.mint(wallet2Address, 100).send({ from: wallet1Address, gas: 200000 })
		const itemId = toItemId(`${conf.testErc721.options.address}:1`)

		await awaitItem(raribleSdk, itemId)

		const sellAction = await sdk1.order.sell({ itemId })
		const hash = await sellAction.submit.start({
			amount: toBigNumber("1"),
			price: toBigNumber("1"),
			currency: { "@type": "ERC20", contract: toUnionAddress(conf.testErc20.options.address) },
		}).runAll()

		await awaitStockToBe(raribleSdk, hash, 1)

		const fillAction = await sdk2.order.fill({ orderId: toOrderId(hash) })

		const tx = await fillAction.submit.start({ amount: 1 })
			.runAll()
		await tx.wait()

		await awaitStockToBe(raribleSdk, hash, 0)
	})
})
