// eslint-disable-next-line camelcase
import { in_memory_provider } from "tezos-sdk-module/dist/providers/in_memory/in_memory_provider"
import { TezosWallet } from "@rarible/sdk-wallet"
import { toContractAddress } from "@rarible/types"
import type { NftItemMeta } from "tezos-api-client/build"
import { createRaribleSdk } from "../../index"
import { MintType } from "../../types/nft/mint/domain"
import { delay, retry } from "../../common/retry"
import { awaitForItemSupply } from "./test/await-for-item-supply"

describe("cancel test", () => {
	const tezos = in_memory_provider(
		"edsk3UUamwmemNBJgDvS8jXCgKsvjL2NoTwYRFpGSRPut4Hmfs6dG8",
		"https://hangzhou.tz.functori.com"
	)
	const wallet = new TezosWallet(tezos)
	const sdk = createRaribleSdk(wallet, "dev")

	let nftContract: string = "KT1CHLDcbogVfVtRbg2TZKvL5p5w9WvhYe2G"

	test.skip("cancel order", async () => {
		const mintResponse = await sdk.nft.mint({
			collectionId: toContractAddress(`TEZOS:${nftContract}`),
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
})
