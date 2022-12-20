import { toCollectionId, toItemId, toUnionAddress } from "@rarible/types"
import BigNumber from "bignumber.js"
import { createRaribleSdk } from "../../index"
import { MintType } from "../../types/nft/mint/prepare"
import { LogsLevel } from "../../domain"
import { retry } from "../../common/retry"
import type { RaribleSdkEnvironment } from "../../config/domain"
import { awaitItemSupply } from "../../common/test/await-item-supply"
import { OriginFeeSupport } from "../../types/order/fill/domain"
import { awaitForOrder } from "./test/await-for-order"
import { createTestWallet } from "./test/test-wallet"
import { getTestContract } from "./test/test-contracts"

describe.skip("sell test", () => {
	const env: RaribleSdkEnvironment = "testnet"
	const sellerWallet = createTestWallet(
		"edskRqrEPcFetuV7xDMMFXHLMPbsTawXZjH9yrEz4RBqH1" +
    "D6H8CeZTTtjGA3ynjTqD8Sgmksi7p5g3u5KUEVqX2EWrRnq5Bymj",
		env
	)
	const sellerSdk = createRaribleSdk(sellerWallet, env, { logs: LogsLevel.DISABLED })

	const nftContract: string = getTestContract(env, "nftContract")
	const mtContract: string = getTestContract(env, "mtContract")

	test("sell NFT test", async () => {
		const sellerAddress = await sellerWallet.provider.address()
		const mintResponse = await sellerSdk.nft.mint.prepare({
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

		await awaitItemSupply(sellerSdk, mintResult.itemId, "1")

		const sellAction = await sellerSdk.order.sell.prepare({
			itemId: mintResult.itemId,
		})

		const orderId = await sellAction.submit({
			amount: 1,
			price: "0.02",
			currency: {
				"@type": "XTZ",
			},
			payouts: [{
				account: toUnionAddress(`TEZOS:${sellerAddress}`),
				value: 10000,
			}],
		})

		await awaitForOrder(sellerSdk, orderId)
		const updateAction = await sellerSdk.order.sellUpdate.prepare({
			orderId,
		})
		const createdOrderId = await updateAction.submit({ price: "0.01" })

		await retry(10, 2000, async () => {
			const updatedOrder = await sellerSdk.apis.order.getOrderById({
				id: createdOrderId,
			})
			expect(new BigNumber(updatedOrder.take.value).toString()).toBe(new BigNumber("0.01").toString())
		})
	}, 1500000)

	test("sell MT test", async () => {
		const mintResponse = await sellerSdk.nft.mint.prepare({
			collectionId: toCollectionId(mtContract),
		})
		const mintResult = await mintResponse.submit({
			uri: "ipfs://bafkreiaz7n5zj2qvtwmqnahz7rwt5h37ywqu7znruiyhwuav3rbbxzert4",
			supply: 10,
			lazyMint: false,
		})
		if (mintResult.type === MintType.ON_CHAIN) {
			await mintResult.transaction.wait()
		}

		console.log("mint", mintResult)
		await awaitItemSupply(sellerSdk, mintResult.itemId, "10")

		const sellAction = await sellerSdk.order.sell.prepare({
			itemId: mintResult.itemId,
		})

		const orderId = await sellAction.submit({
			amount: 5,
			price: "0.02",
			currency: {
				"@type": "XTZ",
			},
		})
		await awaitForOrder(sellerSdk, orderId)

	}, 2900000)

	test("get future order fees", async () => {
		const fees = await sellerSdk.restriction.getFutureOrderFees(
			toItemId("TEZOS:KT1Uke8qc4YTfP41dGuoGC8UsgRyCtyvKPLA:1282")
		)
		expect(fees.originFeeSupport).toBe(OriginFeeSupport.FULL)
		expect(fees.baseFee).toBe(0)
	})
})
