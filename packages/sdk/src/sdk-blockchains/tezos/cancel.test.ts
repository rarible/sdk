// eslint-disable-next-line camelcase
import { toCollectionId } from "@rarible/types"
import { createRaribleSdk } from "../../index"
import { MintType } from "../../types/nft/mint/prepare"
import { delay, retry } from "../../common/retry"
import { LogsLevel } from "../../domain"
import type { RaribleSdkEnvironment } from "../../config/domain"
import { getSdkConfig } from "../../config"
import { createApisSdk } from "../../common/apis"
import { awaitItemSupply } from "../../common/test/await-item-supply"
import { createTestWallet } from "./test/test-wallet"
import { getTestContract } from "./test/test-contracts"
import { getMaybeTezosProvider } from "./common"
import { TezosSell } from "./sell"

describe("cancel test", () => {
	const env: RaribleSdkEnvironment = "testnet"
	const wallet = createTestWallet("edsk3UUamwmemNBJgDvS8jXCgKsvjL2NoTwYRFpGSRPut4Hmfs6dG8", env)
	const sdk = createRaribleSdk(wallet, env, { logs: LogsLevel.DISABLED })

	const sdkConfig = getSdkConfig(env)
	const sellerTezosProvider = getMaybeTezosProvider(wallet.provider, sdkConfig.tezosNetwork, sdkConfig)
	const unionApis = createApisSdk(env, undefined)
	const sellerSellService = new TezosSell(sellerTezosProvider, unionApis)
	const nftContract: string = getTestContract(env, "nftContract")

	test("cancel order", async () => {
		const mintResponse = await sdk.nft.mint.prepare({
			collectionId: toCollectionId(nftContract),
		})
		const mintResult = await mintResponse.submit({
			uri: "ipfs://bafkreiaz7n5zj2qvtwmqnahz7rwt5h37ywqu7znruiyhwuav3rbbxzert4",
			supply: 1,
			lazyMint: false,
		})
		if (mintResult.type === MintType.ON_CHAIN) {
			await mintResult.transaction.wait()
		}

		await awaitItemSupply(sdk, mintResult.itemId, "1")

		const sellAction = await sdk.order.sell.prepare({
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
		await retry(10, 2000, async () => {
			const canceledOrder = await sdk.apis.order.getOrderById({
				id: orderId,
			})
			if (canceledOrder.status !== "CANCELLED") {
				throw new Error("Order has not been cancelled")
			}
		})


	}, 1500000)

	test("cancel order with basic function", async () => {
		const mintResult = await sdk.nft.mint({
			collectionId: toCollectionId(nftContract),
			uri: "ipfs://bafkreiaz7n5zj2qvtwmqnahz7rwt5h37ywqu7znruiyhwuav3rbbxzert4",
		})
		await mintResult.transaction.wait()

		await awaitItemSupply(sdk, mintResult.itemId, "1")

		const orderId = await sdk.order.sell({
			itemId: mintResult.itemId,
			price: "0.000001",
			currency: {
				"@type": "XTZ",
			},
		})

		await retry(10, 2000, async () => {
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
		await retry(20, 2000, async () => {
			const canceledOrder = await sdk.apis.order.getOrderById({
				id: orderId,
			})
			if (canceledOrder.status !== "CANCELLED") {
				throw new Error("Order has not been cancelled")
			}
		})

	}, 1500000)

	test("cancel v1 order", async () => {
		const mintResponse = await sdk.nft.mint.prepare({
			collectionId: toCollectionId(nftContract),
		})
		const mintResult = await mintResponse.submit({
			uri: "ipfs://bafkreiaz7n5zj2qvtwmqnahz7rwt5h37ywqu7znruiyhwuav3rbbxzert4",
			supply: 1,
			lazyMint: false,
		})
		if (mintResult.type === MintType.ON_CHAIN) {
			await mintResult.transaction.wait()
		}

		await awaitItemSupply(sdk, mintResult.itemId, "1")

		const orderId = await sellerSellService.sellV1({
			itemId: mintResult.itemId,
			amount: 1,
			price: "0.002",
			currency: { "@type": "XTZ" },
		})

		await retry(30, 2000, async () => {
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
		await retry(20, 2000, async () => {
			const canceledOrder = await sdk.apis.order.getOrderById({
				id: orderId,
			})
			if (canceledOrder.status !== "CANCELLED") {
				throw new Error("Order has not been cancelled")
			}
		})


	}, 1500000)
})
