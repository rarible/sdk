// eslint-disable-next-line camelcase
import { in_memory_provider } from "tezos-sdk-module/dist/providers/in_memory/in_memory_provider"
import { TezosWallet } from "@rarible/sdk-wallet"
import { toContractAddress, toOrderId } from "@rarible/types"
import BigNumber from "bignumber.js"
import { deploy_nft_public } from "tezos-sdk-module"
import { createRaribleSdk } from "../../index"
import { MintType } from "../../types/nft/mint/domain"
import { delay, retry } from "../../common/retry"

describe("cancel test", () => {
	const tezos = in_memory_provider(
		"edsk3UUamwmemNBJgDvS8jXCgKsvjL2NoTwYRFpGSRPut4Hmfs6dG8",
		"https://hangzhou.tz.functori.com"
	)
	const wallet = new TezosWallet(tezos)
	const sdk = createRaribleSdk(wallet, "dev")

	let nftContract: string = "KT1CHLDcbogVfVtRbg2TZKvL5p5w9WvhYe2G"
	// let nftContract: string = "KT1Co8iAMMSj7aC8z5Ruk7m3THbiFcAjhH1o"

	/*
	beforeAll(async () => {
		const provider = {
			tezos,
			api: "https://rarible-api.functori.com/v0.1",
			config: {
				exchange: "KT1AguExF32Z9UEKzD5nuixNmqrNs1jBKPT8",
				fees: new BigNumber(0),
				nft_public: "",
				mt_public: "",
			},
		}
		const sender = await tezos.address()
		console.log("sender", sender)
		const nft = await deploy_nft_public(provider, sender)
		console.log("nft", nft.contract)
		nftContract = nft.contract as any
		await nft.confirmation()
	})

   */

	test("cancel order", async () => {
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

		await retry(10, 1000, async () => {
			await sdk.apis.item.getItemById({
				itemId: mintResult.itemId,
			})
		})

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
				// id: toOrderId("TEZOS:fa33e0e6acad0c787b76ba9c387fc1c73cc8b27859bf1667c53535546807543e"),
				id: orderId,
			})
			if (canceledOrder.status !== "CANCELLED") {
				throw new Error("Order has not been cancelled")
			}
		})


	}, 1500000)
})
