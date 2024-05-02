import { EthereumWallet } from "@rarible/sdk-wallet"
import { getTestContract } from "@rarible/ethereum-sdk-test-common"
import { toCollectionId, toUnionAddress } from "@rarible/types"
import { Blockchain } from "@rarible/api-client"
import type { IRaribleSdk } from "../../index"
import { awaitItem } from "../../common/test/await-item"
import { generateExpirationDate } from "../../common/suite/order"
import { createSdk } from "../../common/test/create-sdk"
import { DEV_PK_1, DEV_PK_2 } from "./test/common"
import { createE2eTestProvider } from "./test/init-providers"
import { convertEthereumCollectionId } from "./common"

describe("Batch buy", () => {
	const { web3Ethereum: ethereum1 } = createE2eTestProvider(DEV_PK_1)
	const { web3Ethereum: ethereum2 } = createE2eTestProvider(DEV_PK_2)

	const sdkSeller = createSdk(new EthereumWallet(ethereum1), "development")

	const sdkBuyer = createSdk(new EthereumWallet(ethereum2), "development")

	test("batch buy rarible orders", async () => {
		const token1 = await mint(sdkSeller)
		const token2 = await mint(sdkSeller)
		const tokens = [token1, token2]
		const orders = await Promise.all(tokens.map(async (token) => {
			const prep = await sdkSeller.order.sell.prepare({ itemId: token.id })
			return await prep.submit({
				amount: 1,
				price: "0.0001",
				currency: { "@type": "ETH" },
				expirationDate: generateExpirationDate(),
			})
		}))

		//console.log(orders)
		const prep = await sdkBuyer.order.batchBuy.prepare(orders.map((order) => ({ orderId: order })))
		const tx = await prep.submit(orders.map((order) => ({
			orderId: order,
			amount: 1,
			originFees: [{
				account: toUnionAddress("ETHEREUM:0xFc7b41fFC023bf3eab6553bf4881D45834EF1E8a"),
				value: 100,
			}],
		})))
		expect(tx.transaction.data.endsWith("000009616c6c64617461")).toEqual(true)
		await tx.wait()
	})

	test("batch buy rarible orders with simplified function", async () => {
		const token1 = await mint(sdkSeller)
		const token2 = await mint(sdkSeller)
		const tokens = [token1, token2]
		const orders = await Promise.all(tokens.map(async (token) => {
			await awaitItem(sdkSeller, token.id)
			const prep = await sdkSeller.order.sell.prepare({ itemId: token.id })
			return await prep.submit({
				amount: 1,
				price: "0.0001",
				currency: { "@type": "ETH" },
				expirationDate: generateExpirationDate(),
			})
		}))

		const ordersRequests = orders.map((order) => ({
			orderId: order,
			amount: 1,
			originFees: [{
				account: toUnionAddress("ETHEREUM:0xFc7b41fFC023bf3eab6553bf4881D45834EF1E8a"),
				value: 100,
			}],
		}))
		const tx = await sdkBuyer.order.batchBuy(ordersRequests)
		await tx.wait()
	})

	test.concurrent("get buy amm info", async () => {
		if (!sdkBuyer.ethereum) {
			throw new Error("Sdk was initialized without ethereum provider")
		}
		const data = await sdkBuyer.ethereum.getBatchBuyAmmInfo({
			hash: "0x0000000000000000000000003be56db77c0b983272a526d7df976e837c44c4fb",
			numNFTs: 5,
		})
		expect(data.prices[4].price).toBeTruthy()
	})
})

async function mint(sdk: IRaribleSdk) {
	const contract = convertEthereumCollectionId(
		getTestContract("dev-ethereum", "erc721V3"),
		Blockchain.ETHEREUM
	)
	const action = await sdk.nft.mint.prepare({
		collectionId: toCollectionId(contract),
	})

	const result = await action.submit({
		uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
		royalties: [],
		lazyMint: false,
		supply: 1,
	})

	return awaitItem(sdk, result.itemId)
}
