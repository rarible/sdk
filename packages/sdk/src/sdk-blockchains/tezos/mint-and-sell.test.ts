import { toContractAddress } from "@rarible/types"
import BigNumber from "bignumber.js"
import { deploy_nft_public } from "tezos-sdk-module"
import { createRaribleSdk } from "../../index"
import { createTestWallet } from "./test/test-wallet"

describe("test tezos mint and sell", () => {
	const sellerWallet = createTestWallet(
		"edskRqrEPcFetuV7xDMMFXHLMPbsTawXZjH9yrEz4RBqH1" +
    "D6H8CeZTTtjGA3ynjTqD8Sgmksi7p5g3u5KUEVqX2EWrRnq5Bymj"
	)
	const sellerSdk = createRaribleSdk(
		sellerWallet,
		"dev"
	)

	let nftContract: string = "KT1EWB3JaMmZ5BmNqHVBjB4re62FLihp4G6C"
	let mtContract: string = "KT18vSGouhJcJZDDgrbBKkdCBjSXJWSbui3i"

	test("mint and sell nft", async () => {
		const mintAndSellAction = await sellerSdk.nft.mintAndSell({
			collectionId: toContractAddress(`TEZOS:${nftContract}`),
		})

		const orderId = await mintAndSellAction.submit({
			price: new BigNumber("0.0001"),
			currency: { "@type": "XTZ" },
			uri: "ipfs://bafkreiaz7n5zj2qvtwmqnahz7rwt5h37ywqu7znruiyhwuav3rbbxzert4",
			supply: 1,
			lazyMint: false,
		})
		console.log("orderId", orderId)
	})

	test.skip("mint and sell mt", async () => {
		const mintAndSellAction = await sellerSdk.nft.mintAndSell({
			collectionId: toContractAddress(`TEZOS:${mtContract}`),
		})

		const r = await mintAndSellAction.submit({
			price: new BigNumber("0.0001"),
			currency: { "@type": "XTZ" },
			uri: "ipfs://bafkreiaz7n5zj2qvtwmqnahz7rwt5h37ywqu7znruiyhwuav3rbbxzert4",
			supply: 1,
			lazyMint: false,
		})
		console.log(r)
	})
})
