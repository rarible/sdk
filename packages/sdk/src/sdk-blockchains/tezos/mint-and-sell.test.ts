import { toCollectionId } from "@rarible/types"
import BigNumber from "bignumber.js"
import { createRaribleSdk } from "../../index"
import { LogsLevel } from "../../domain"
import { createTestWallet } from "./test/test-wallet"

describe.skip("test tezos mint and sell", () => {
	const sellerWallet = createTestWallet(
		"edskRqrEPcFetuV7xDMMFXHLMPbsTawXZjH9yrEz4RBqH1" +
    "D6H8CeZTTtjGA3ynjTqD8Sgmksi7p5g3u5KUEVqX2EWrRnq5Bymj"
	)
	const sellerSdk = createRaribleSdk(sellerWallet, "dev", { logs: LogsLevel.DISABLED })

	let nftContract: string = "KT1EreNsT2gXRvuTUrpx6Ju4WMug5xcEpr43"
	let mtContract: string = "KT1RuoaCbnZpMgdRpSoLfJUzSkGz1ZSiaYwj"

	test.skip("mint and sell nft", async () => {
		const mintAndSellAction = await sellerSdk.nft.mintAndSell({
			collectionId: toCollectionId(`TEZOS:${nftContract}`),
		})

		await mintAndSellAction.submit({
			price: new BigNumber("0.0001"),
			currency: { "@type": "XTZ" },
			uri: "ipfs://bafkreiaz7n5zj2qvtwmqnahz7rwt5h37ywqu7znruiyhwuav3rbbxzert4",
			supply: 1,
			lazyMint: false,
		})
	})

	test.skip("mint and sell mt", async () => {
		const mintAndSellAction = await sellerSdk.nft.mintAndSell({
			collectionId: toCollectionId(`TEZOS:${mtContract}`),
		})

		await mintAndSellAction.submit({
			price: new BigNumber("0.0001"),
			currency: { "@type": "XTZ" },
			uri: "ipfs://bafkreiaz7n5zj2qvtwmqnahz7rwt5h37ywqu7znruiyhwuav3rbbxzert4",
			supply: 1,
			lazyMint: false,
		})
	})
})
