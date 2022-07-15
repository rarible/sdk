// eslint-disable-next-line camelcase
import { toCollectionId } from "@rarible/types"
import { createRaribleSdk } from "../../index"
import { MintType } from "../../types/nft/mint/domain"
import { retry } from "../../common/retry"
import { LogsLevel } from "../../domain"
import type { RaribleSdkEnvironment } from "../../config/domain"
import { awaitItemSupply } from "../ethereum/test/await-item-supply"
import { createTestWallet } from "./test/test-wallet"
import { getTestContract } from "./test/test-contracts"

describe.skip("cancel test", () => {
	const env: RaribleSdkEnvironment = "testnet"
	const wallet = createTestWallet("edsk3UUamwmemNBJgDvS8jXCgKsvjL2NoTwYRFpGSRPut4Hmfs6dG8", env)
	const sdk = createRaribleSdk(wallet, env, { logs: LogsLevel.DISABLED })

	const nftContract: string = getTestContract(env, "nftContract")

	test("cancel order", async () => {
		const mintResponse = await sdk.nft.mint({
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

		await retry(20, 2000, async () => {
			const order = await sdk.apis.order.getOrderById({
				id: orderId,
			})
			if (order.status !== "ACTIVE") {
				throw new Error("Order status is not active")
			}
		})

		// await delay(5000)
		const cancelTx = await sdk.order.cancel({
			orderId,
		})
		await cancelTx.wait()
		await retry(40, 2000, async () => {
			const canceledOrder = await sdk.apis.order.getOrderById({
				id: orderId,
			})
			if (canceledOrder.status !== "CANCELLED") {
				throw new Error("Order has not been cancelled")
			}
		})


	}, 1500000)
})
