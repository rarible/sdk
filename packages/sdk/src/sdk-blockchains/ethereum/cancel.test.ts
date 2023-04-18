import { awaitAll, deployTestErc20, deployTestErc721 } from "@rarible/ethereum-sdk-test-common"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import { EthereumWallet } from "@rarible/sdk-wallet"
import { toCollectionId, toContractAddress, toItemId } from "@rarible/types"
import { Blockchain } from "@rarible/api-client"
import type { BlockchainEthereumTransaction } from "@rarible/sdk-transaction/src"
import { createRaribleSdk } from "../../index"
import { LogsLevel } from "../../domain"
import { awaitItem } from "../../common/test/await-item"
import { awaitStock } from "../../common/test/await-stock"
import { initProviders } from "./test/init-providers"
import { convertEthereumContractAddress } from "./common"
import { DEV_PK_1 } from "./test/common"

describe("cancel", () => {
	const { web31, wallet1 } = initProviders({ pk1: DEV_PK_1 })
	const ethereum1 = new Web3Ethereum({ web3: web31 })
	const ethereumWallet = new EthereumWallet(ethereum1)
	const sdk1 = createRaribleSdk(ethereumWallet, "development", { logs: LogsLevel.DISABLED })

	const erc721Address = convertEthereumContractAddress("0x64F088254d7EDE5dd6208639aaBf3614C80D396d", Blockchain.ETHEREUM)

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

		const sellAction = await sdk1.order.sell.prepare({ itemId })
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

		const tx = await sdk1.order.cancel({ orderId })
		await tx.wait()

		await checkCancelEvent(tx as BlockchainEthereumTransaction)

		// const cancelledOrder = await awaitOrderCancel(sdk1, orderId)
		// expect(cancelledOrder.cancelled).toEqual(true)
	})

	test("sell and cancel with basic function", async () => {
		const mintResult = await sdk1.nft.mint({
			uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
			collectionId: toCollectionId(erc721Address),
		})
		await mintResult.transaction.wait()
		await awaitItem(sdk1, mintResult.itemId)

		const orderId = await sdk1.order.sell({
			itemId: mintResult.itemId,
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

		const tx = await sdk1.order.cancel({ orderId })
		await tx.wait()

		await checkCancelEvent(tx as BlockchainEthereumTransaction)
	})
})

async function checkCancelEvent(tx: BlockchainEthereumTransaction) {
	expect((await tx.wait()).events.some(e => e.event === "Cancel")).toBe(true)
}
