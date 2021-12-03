import { toContractAddress, toOrderId, toUnionAddress } from "@rarible/types"
import BigNumber from "bignumber.js"
import { createRaribleSdk } from "../../index"
import { MintType } from "../../types/nft/mint/domain"
import { awaitForOrder } from "./test/await-for-order"
import { awaitForItemSupply } from "./test/await-for-item-supply"
import { createTestWallet } from "./test/test-wallet"

describe("sell test", () => {
	const sellerWallet = createTestWallet(
		"edskRqrEPcFetuV7xDMMFXHLMPbsTawXZjH9yrEz4RBqH1" +
    "D6H8CeZTTtjGA3ynjTqD8Sgmksi7p5g3u5KUEVqX2EWrRnq5Bymj")
	const sellerSdk = createRaribleSdk(sellerWallet, "dev")

	let nftContract: string = "KT1DK9ArYc2QVgqr4jz46WnWt5g9zsE3Cifb"
	let mtContract: string = "KT18vSGouhJcJZDDgrbBKkdCBjSXJWSbui3i"


	test.skip("sell NFT test", async () => {
		const sellerAddress = await sellerWallet.provider.address()
		const mintResponse = await sellerSdk.nft.mint({
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

		await awaitForItemSupply(sellerSdk, mintResult.itemId, "1")

		const sellAction = await sellerSdk.order.sell({
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
		const updateAction = await sellerSdk.order.sellUpdate({
			orderId,
		})
		const createdOrderId = await updateAction.submit({ price: "0.01" })

		const updatedOrder = await sellerSdk.apis.order.getOrderById({
			id: createdOrderId,
		})
		expect(new BigNumber(updatedOrder.take.value).toString()).toBe(new BigNumber("0.01").toString())
	}, 1500000)

	test.skip("sell MT test", async () => {
		const sellerAddress = await sellerWallet.provider.address()
		const mintResponse = await sellerSdk.nft.mint({
			collectionId: toContractAddress(`TEZOS:${mtContract}`),
		})
		const mintResult = await mintResponse.submit({
			uri: "ipfs://bafkreiaz7n5zj2qvtwmqnahz7rwt5h37ywqu7znruiyhwuav3rbbxzert4",
			supply: 10,
			lazyMint: false,
		})
		if (mintResult.type === MintType.ON_CHAIN) {
			await mintResult.transaction.wait()
		}

		await awaitForItemSupply(sellerSdk, mintResult.itemId, "10")

		const sellAction = await sellerSdk.order.sell({
			itemId: mintResult.itemId,
		})

		const orderId = await sellAction.submit({
			amount: 5,
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

		const updateAction = await sellerSdk.order.sellUpdate({ orderId })
		const createdOrderId = await updateAction.submit({ price: "0.01" })

		const updatedOrder = await sellerSdk.apis.order.getOrderById({
			id: createdOrderId,
		})
		expect(new BigNumber(updatedOrder.take.value).toString()).toBe(new BigNumber("0.01").toString())
	}, 2900000)

})
