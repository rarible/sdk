// eslint-disable-next-line camelcase
import { in_memory_provider } from "tezos-sdk-module/dist/providers/in_memory/in_memory_provider"
import { TezosWallet } from "@rarible/sdk-wallet"
import { toContractAddress } from "@rarible/types"
import { createRaribleSdk } from "../../index"
import { MintType } from "../../types/nft/mint/domain"
import { awaitForOrder } from "./test/await-for-order"
import { awaitForItemSupply } from "./test/await-for-item-supply"

describe("sell test", () => {
	const sellerTezos = in_memory_provider(
		"edskRqrEPcFetuV7xDMMFXHLMPbsTawXZjH9yrEz4RBqH1D6H8CeZTTtjGA3ynjTqD8Sgmksi7p5g3u5KUEVqX2EWrRnq5Bymj",
		"https://hangzhou.tz.functori.com",
	)
	const sellerWallet = new TezosWallet(sellerTezos)
	const sellerSdk = createRaribleSdk(sellerWallet, "dev")

	let nftContract: string = "KT1DK9ArYc2QVgqr4jz46WnWt5g9zsE3Cifb"
	let mtContract: string = "KT18vSGouhJcJZDDgrbBKkdCBjSXJWSbui3i"


	test.skip("sell NFT test", async () => {
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
		})

		await awaitForOrder(sellerSdk, orderId)
	}, 1500000)


	test.skip("sell MT test", async () => {
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
		})

		await awaitForOrder(sellerSdk, orderId)
	}, 2900000)

})
