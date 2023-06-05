import { createE2eProvider } from "@rarible/ethereum-sdk-test-common"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import { EthereumWallet } from "@rarible/sdk-wallet"
import { toCollectionId, toContractAddress, toUnionAddress } from "@rarible/types"
import Web3 from "web3"
import type { IRaribleSdk } from "../../index"
import { awaitItem } from "../../common/test/await-item"
import { DEV_PK_1, DEV_PK_2 } from "./test/common"
import { createSdk } from "./test/create-sdk"

describe("Batch buy", () => {
	const { provider: providerSeller } = createE2eProvider(DEV_PK_1)
	const { provider: providerBuyer } = createE2eProvider(DEV_PK_2)

	const web31 = new Web3(providerSeller)
	const ethereum1 = new Web3Ethereum({ web3: web31 })
	const sdkSeller = createSdk(new EthereumWallet(ethereum1), "development")

	const web32 = new Web3(providerBuyer)
	const ethereum2 = new Web3Ethereum({ web3: web32 })
	const sdkBuyer = createSdk(new EthereumWallet(ethereum2), "development")

	test("batch buy rarible orders", async () => {
		const token1 = await mint(sdkSeller)
		const token2 = await mint(sdkSeller)
		const tokens = [token1, token2]
		const orders = await Promise.all(tokens.map(async (token) => {
			const prep = await sdkSeller.order.sell.prepare({ itemId: token.id })
			return await prep.submit({
				amount: 1,
				price: "0.00000000001",
				currency: { "@type": "ETH" },
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
				price: "0.00000000001",
				currency: { "@type": "ETH" },
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
			hash: "0x000000000000000000000000fc065082a3a05f1605d94113987c0fac117b20e7",
			numNFTs: 5,
		})
		expect(data.prices[4].price).toBeTruthy()
	})
})

async function mint(sdk: IRaribleSdk) {
	const contract = toContractAddress("ETHEREUM:0x6972347e66A32F40ef3c012615C13cB88Bf681cc") //erc721
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
