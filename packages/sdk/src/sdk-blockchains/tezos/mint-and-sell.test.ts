import { toCollectionId } from "@rarible/types"
import BigNumber from "bignumber.js"
import { awaitAll } from "@rarible/ethereum-sdk-test-common"
import { createRaribleSdk } from "../../index"
import { LogsLevel } from "../../domain"
import type { RaribleSdkEnvironment } from "../../config/domain"
import { createTestWallet } from "./test/test-wallet"
import { getTestContract } from "./test/test-contracts"

describe.skip("test tezos mint and sell", () => {
	const env: RaribleSdkEnvironment = "development"
	const sellerWallet = createTestWallet(
		"edskRqrEPcFetuV7xDMMFXHLMPbsTawXZjH9yrEz4RBqH1" +
    "D6H8CeZTTtjGA3ynjTqD8Sgmksi7p5g3u5KUEVqX2EWrRnq5Bymj",
		env
	)
	const it = awaitAll({
		sellerSdk: createRaribleSdk(sellerWallet, env, { logs: LogsLevel.DISABLED }),
	})

	const nftContract: string = getTestContract(env, "nftContract")
	const mtContract: string = getTestContract(env, "mtContract")

	test("mint and sell nft", async () => {
		const mintAndSellAction = await it.sellerSdk.nft.mintAndSell.prepare({
			collectionId: toCollectionId(nftContract),
		})

		await mintAndSellAction.submit({
			price: new BigNumber("0.0001"),
			currency: { "@type": "XTZ" },
			uri: "ipfs://bafkreiaz7n5zj2qvtwmqnahz7rwt5h37ywqu7znruiyhwuav3rbbxzert4",
			supply: 1,
			lazyMint: false,
		})
	})

	test("mint and sell nft with basic function", async () => {
		const mintAndSellAction = await it.sellerSdk.nft.mintAndSell({
			collectionId: toCollectionId(nftContract),
			price: new BigNumber("0.0001"),
			currency: { "@type": "XTZ" },
			uri: "ipfs://bafkreiaz7n5zj2qvtwmqnahz7rwt5h37ywqu7znruiyhwuav3rbbxzert4",
		})
		await mintAndSellAction.transaction.wait()
	})

	test("mint and sell mt", async () => {
		const mintAndSellAction = await it.sellerSdk.nft.mintAndSell.prepare({
			collectionId: toCollectionId(mtContract),
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
