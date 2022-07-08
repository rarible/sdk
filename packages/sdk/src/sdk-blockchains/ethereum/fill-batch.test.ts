import { Web3Ethereum } from "@rarible/web3-ethereum"
import { EthereumWallet } from "@rarible/sdk-wallet"
import { toAddress } from "@rarible/types"
import { Blockchain } from "@rarible/api-client"
import { createRaribleSdk } from "../../index"
import { LogsLevel } from "../../domain"
import { MintType } from "../../types/nft/mint/domain"
import { initProviders } from "./test/init-providers"
import { convertEthereumCollectionId, convertEthereumToUnionAddress } from "./common"
import { awaitItem } from "./test/await-item"
import { awaitStock } from "./test/await-stock"

describe("prepareOrderForBatchPurchase", () => {
	const { web31, web32, wallet1 } = initProviders()
	const ethereum1 = new Web3Ethereum({ web3: web31 })
	const ethereum2 = new Web3Ethereum({ web3: web32 })
	const sdk1 = createRaribleSdk(new EthereumWallet(ethereum1), "development", { logs: LogsLevel.DISABLED })
	const sdk2 = createRaribleSdk(new EthereumWallet(ethereum2), "development", { logs: LogsLevel.DISABLED })

	const erc721Address = toAddress("0x64F088254d7EDE5dd6208639aaBf3614C80D396d")

	test("erc721 sell/buy for ETH using buyBatch, should throw insufficient funds", async () => {
		const wallet1Address = wallet1.getAddressString()

		const action = await sdk1.nft.mint({
			collectionId: convertEthereumCollectionId(erc721Address, Blockchain.ETHEREUM),
		})
		const result = await action.submit({
			uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
			creators: [{
				account: convertEthereumToUnionAddress(wallet1Address, Blockchain.ETHEREUM),
				value: 10000,
			}],
			royalties: [],
			lazyMint: false,
			supply: 1,
		})
		if (result.type === MintType.ON_CHAIN) {
			await result.transaction.wait()
		}

		await awaitItem(sdk1, result.itemId)

		const sellAction = await sdk1.order.sell({ itemId: result.itemId })
		const orderId = await sellAction.submit({
			amount: 1,
			price: "0.000000000000000002",
			currency: {
				"@type": "ETH",
			},
			expirationDate: new Date(Date.now() + 200000),
		})

		const nextStock = "1"
		const order = await awaitStock(sdk1, orderId, nextStock)
		expect(order.makeStock.toString()).toEqual(nextStock)

		const fillAction = await sdk2.order.buyBatch([{ orderId }])
		// const tx = await fillAction.submit([{
		// 	orderId,
		// 	amount: 1,
		// }])
		// await tx.wait()
		try {
			const tx = await fillAction.submit([{
				orderId,
				amount: 1,
			}])
			await tx.wait()
		} catch (e) {
			// @ts-ignore
			expect(e.message).toContain("insufficient funds for gas * price + value")
		}
	})

})
