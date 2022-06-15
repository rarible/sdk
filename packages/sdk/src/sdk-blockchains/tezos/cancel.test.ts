// eslint-disable-next-line camelcase
import { toBigNumber, toCollectionId, toContractAddress } from "@rarible/types"
import { createRaribleSdk } from "../../index"
import { MintType } from "../../types/nft/mint/domain"
import { delay, retry } from "../../common/retry"
import { LogsLevel } from "../../domain"
import { createApisSdk } from "../../common/apis"
import { awaitForItemSupply } from "./test/await-for-item-supply"
import { createTestWallet } from "./test/test-wallet"
import { getMaybeTezosProvider, getTezosAPIs } from "./common"
import { TezosSell } from "./sell"

describe("cancel test", () => {
	const wallet = createTestWallet("edsk3UUamwmemNBJgDvS8jXCgKsvjL2NoTwYRFpGSRPut4Hmfs6dG8")
	const env = "development"
	const sdk = createRaribleSdk(wallet, env, { logs: LogsLevel.DISABLED })

	const tezosNetwork = "dev"
	const sellerTezosProvider = getMaybeTezosProvider(wallet.provider, tezosNetwork)
	const apis = getTezosAPIs(tezosNetwork)
	const unionApis = createApisSdk(env, undefined)
	const sellerSellService = new TezosSell(sellerTezosProvider, apis, unionApis)

	let nftContract: string = "KT1PuABq2ReD789KtKetktvVKJcCMpyDgwUx"
	const eurTzContract = "KT1HvTfYG7DgeujAQ1LDvCHiQc29VMycoJh5"

	test("cancel order", async () => {
		const mintResponse = await sdk.nft.mint({
			collectionId: toCollectionId(`TEZOS:${nftContract}`),
		})
		const mintResult = await mintResponse.submit({
			uri: "ipfs://bafkreiaz7n5zj2qvtwmqnahz7rwt5h37ywqu7znruiyhwuav3rbbxzert4",
			supply: 1,
			lazyMint: false,
		})
		if (mintResult.type === MintType.ON_CHAIN) {
			await mintResult.transaction.wait()
		}

		await awaitForItemSupply(sdk, mintResult.itemId, "1")

		const sellAction = await sdk.order.sell({
			itemId: mintResult.itemId,
		})

		const orderId = await sellAction.submit({
			amount: 1,
			price: "0.000001",
			currency: {
				"@type": "XTZ",
			},
		})

		await retry(10, 1000, async () => {
			const order = await sdk.apis.order.getOrderById({
				id: orderId,
			})
			if (order.status !== "ACTIVE") {
				throw new Error("Order status is not active")
			}
		})

		await delay(10000)
		const cancelTx = await sdk.order.cancel({
			orderId,
		})
		await cancelTx.wait()
		await retry(10, 1000, async () => {
			const canceledOrder = await sdk.apis.order.getOrderById({
				id: orderId,
			})
			if (canceledOrder.status !== "CANCELLED") {
				throw new Error("Order has not been cancelled")
			}
		})


	}, 1500000)

	test("cancel v1 order", async () => {
		const mintResponse = await sdk.nft.mint({
			collectionId: toCollectionId(`TEZOS:${nftContract}`),
		})
		const mintResult = await mintResponse.submit({
			uri: "ipfs://bafkreiaz7n5zj2qvtwmqnahz7rwt5h37ywqu7znruiyhwuav3rbbxzert4",
			supply: 1,
			lazyMint: false,
		})
		if (mintResult.type === MintType.ON_CHAIN) {
			await mintResult.transaction.wait()
		}

		await awaitForItemSupply(sdk, mintResult.itemId, "1")

		const orderId = await sellerSellService.sellV1({
			itemId: mintResult.itemId,
			amount: 1,
			price: "0.002",
			currency: {
				"@type": "TEZOS_FT",
				contract: toContractAddress(
					`TEZOS:${eurTzContract}`
				),
				tokenId: toBigNumber("0"),
			},
		})

		await retry(10, 1000, async () => {
			const order = await sdk.apis.order.getOrderById({
				id: orderId,
			})
			if (order.status !== "ACTIVE") {
				throw new Error("Order status is not active")
			}
		})

		await delay(10000)
		const cancelTx = await sdk.order.cancel({
			orderId,
		})
		await cancelTx.wait()
		await retry(10, 1000, async () => {
			const canceledOrder = await sdk.apis.order.getOrderById({
				id: orderId,
			})
			if (canceledOrder.status !== "CANCELLED") {
				throw new Error("Order has not been cancelled")
			}
		})


	}, 1500000)
})
