import { createE2eProvider } from "@rarible/ethereum-sdk-test-common"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import { EthereumWallet } from "@rarible/sdk-wallet"
import { toCollectionId, toContractAddress, toUnionAddress } from "@rarible/types"
import Web3 from "web3"
import type { IRaribleSdk } from "../../index"
import { createRaribleSdk } from "../../index"
import { LogsLevel } from "../../domain"
import { awaitItem } from "../../common/test/await-item"
import { DEV_PK_1, DEV_PK_2 } from "./test/common"

describe("Batch buy", () => {
	const { provider: providerSeller } = createE2eProvider(DEV_PK_1)
	const { provider: providerBuyer } = createE2eProvider(DEV_PK_2)

	const web31 = new Web3(providerSeller)
	const ethereum1 = new Web3Ethereum({ web3: web31 })
	const sdkSeller = createRaribleSdk(new EthereumWallet(ethereum1), "development", {
		logs: LogsLevel.DISABLED,
	})

	const web32 = new Web3(providerBuyer)
	const ethereum2 = new Web3Ethereum({ web3: web32 })
	const sdkBuyer = createRaribleSdk(new EthereumWallet(ethereum2), "development", {
		logs: LogsLevel.DISABLED,
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

	test("batch buy rarible orders", async () => {
		const tokens = await Promise.all([mint(sdkSeller), mint(sdkSeller)])
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
		console.log(tx)
		await tx.wait()
	})

	test("batch buy rarible orders with simplified function", async () => {
		const tokens = await Promise.all([mint(sdkSeller), mint(sdkSeller)])
		const orders = await Promise.all(tokens.map(async (token) => {
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
		console.log(tx)
		await tx.wait()
	})

	test("get buy amm info", async () => {
		if (!sdkBuyer.ethereum) {
			throw new Error("Sdk was initialized without ethereum provider")
		}
		const data = await sdkBuyer.ethereum.getBatchBuyAmmInfo({
			hash: "0x000000000000000000000000d2bfdbb7be48d63ad3aaf5311786d2da2fc0fbea",
			numNFTs: 5,
		})
		expect(data.prices[4].price).toBeTruthy()
	})
})
