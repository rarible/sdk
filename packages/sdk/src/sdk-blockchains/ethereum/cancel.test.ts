import {
	getTestErc20Contract,
} from "@rarible/ethereum-sdk-test-common"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import { EthereumWallet } from "@rarible/sdk-wallet"
import { toAddress, toCollectionId, toContractAddress } from "@rarible/types"
import { Blockchain } from "@rarible/api-client"
import type { BlockchainEthereumTransaction } from "@rarible/sdk-transaction"
import { createRaribleSdk } from "../../index"
import { LogsLevel } from "../../domain"
import { awaitItem } from "../../common/test/await-item"
import { awaitStock } from "../../common/test/await-stock"
import { initProviders } from "./test/init-providers"
import { convertEthereumContractAddress } from "./common"
import { DEV_PK_1 } from "./test/common"

describe("cancel", () => {
	const { web31 } = initProviders({ pk1: DEV_PK_1 })
	const ethereum1 = new Web3Ethereum({ web3: web31 })
	const ethereumWallet = new EthereumWallet(ethereum1)
	const sdk1 = createRaribleSdk(ethereumWallet, "development", { logs: LogsLevel.DISABLED })

	const erc721Address = convertEthereumContractAddress("0x64F088254d7EDE5dd6208639aaBf3614C80D396d", Blockchain.ETHEREUM)
	const erc20 = toAddress("0xA4A70E8627e858567a9f1F08748Fe30691f72b9e")
	const erc20ContractAddress = convertEthereumContractAddress(erc20, Blockchain.ETHEREUM)

	const testErc20 = getTestErc20Contract(web31, erc20)

	test("sell and cancel", async () => {
		const mintResult = await sdk1.nft.mint({
			uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
			collectionId: toCollectionId(erc721Address),
		})
		await mintResult.transaction.wait()
		await awaitItem(sdk1, mintResult.itemId)

		const sellAction = await sdk1.order.sell.prepare({ itemId: mintResult.itemId })
		const orderId = await sellAction.submit({
			amount: 1,
			price: "0.000000000000000002",
			currency: {
				"@type": "ERC20",
				contract: erc20ContractAddress,
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
				contract: toContractAddress(`ETHEREUM:${testErc20.options.address}`),
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
