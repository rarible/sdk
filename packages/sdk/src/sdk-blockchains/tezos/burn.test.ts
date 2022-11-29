import { toBigNumber, toCollectionId } from "@rarible/types"
import { awaitAll } from "@rarible/ethereum-sdk-test-common"
import { createRaribleSdk } from "../../index"
import { MintType } from "../../types/nft/mint/prepare"
import { LogsLevel } from "../../domain"
import type { RaribleSdkEnvironment } from "../../config/domain"
import { awaitItemSupply } from "../../common/test/await-item-supply"
import { awaitItem } from "../../common/test/await-item"
import { createTestWallet } from "./test/test-wallet"
import { getTestContract } from "./test/test-contracts"

describe.skip("burn test", () => {
	const env: RaribleSdkEnvironment = "testnet"
	const sellerWallet = createTestWallet(
		"edskRqrEPcFetuV7xDMMFXHLMPbsTawXZjH9yrEz4RBqH1" +
    "D6H8CeZTTtjGA3ynjTqD8Sgmksi7p5g3u5KUEVqX2EWrRnq5Bymj",
		env
	)
	const it = awaitAll({
		sdk: createRaribleSdk(sellerWallet, env, { logs: LogsLevel.DISABLED }),
	})

	const nftContract: string = getTestContract(env, "nftContract")
	const mtContract: string = getTestContract(env, "mtContract")

	test("burn NFT token test", async () => {
		const mintResponse = await it.sdk.nft.mint.prepare({
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
		await awaitItem(it.sdk, mintResult.itemId)

		const transfer = await it.sdk.nft.burn.prepare({ itemId: mintResult.itemId })

		const result = await transfer.submit({ amount: 1 })

		if (result) {
		  await result.wait()
		}

		await awaitItemSupply(it.sdk, mintResult.itemId, toBigNumber("0"))
	}, 1500000)

	test("burn MT token test", async () => {
		const mintResponse = await it.sdk.nft.mint.prepare({
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

		await awaitItem(it.sdk, mintResult.itemId)

		const transfer = await it.sdk.nft.burn.prepare({
			itemId: mintResult.itemId,
		})
		const result = await transfer.submit({ amount: 5 })
		if (result) {
		  await result.wait()
		}

		await awaitItemSupply(it.sdk, mintResult.itemId, toBigNumber("5"))
	}, 1500000)

	test("burn NFT token with basic function", async () => {
		const mintResult = await it.sdk.nft.mint({
			collectionId: toCollectionId(nftContract),
			uri: "ipfs://bafkreiaz7n5zj2qvtwmqnahz7rwt5h37ywqu7znruiyhwuav3rbbxzert4",
		})
		await mintResult.transaction.wait()
		await awaitItem(it.sdk, mintResult.itemId)

		const burnTx = await it.sdk.nft.burn({
			itemId: mintResult.itemId,
			amount: 1,
		})
		if (burnTx) {
			await burnTx.wait()
		}
		await awaitItemSupply(it.sdk, mintResult.itemId, "0")
	}, 1500000)

	test("burn NFT token test with basic function", async () => {
		const mintResult = await it.sdk.nft.mint({
			collectionId: toCollectionId(nftContract),
			uri: "ipfs://bafkreiaz7n5zj2qvtwmqnahz7rwt5h37ywqu7znruiyhwuav3rbbxzert4",
			supply: 1,
		})
		await mintResult.transaction.wait()
		await awaitItem(it.sdk, mintResult.itemId)

		const transferResult = await it.sdk.nft.burn({
			itemId: mintResult.itemId,
		})

		if (transferResult) {
			await transferResult.wait()
		}

		await awaitItemSupply(it.sdk, mintResult.itemId, "0")
	}, 1500000)
})
