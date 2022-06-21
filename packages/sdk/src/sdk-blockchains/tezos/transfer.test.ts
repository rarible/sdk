import { toCollectionId, toUnionAddress } from "@rarible/types"
import { createRaribleSdk } from "../../index"
import { MintType } from "../../types/nft/mint/domain"
import { LogsLevel } from "../../domain"
import { createTestWallet } from "./test/test-wallet"
import { awaitForOwnership } from "./test/await-for-ownership"
import { awaitForItemSupply } from "./test/await-for-item-supply"

describe("transfer test", () => {
	const wallet = createTestWallet("edsk3UUamwmemNBJgDvS8jXCgKsvjL2NoTwYRFpGSRPut4Hmfs6dG8")
	const sdk = createRaribleSdk(wallet, "development", { logs: LogsLevel.DISABLED })

	const recipient = "tz1VXxRfyFHoPXBVUrWY5tsa1oWevrgChhSg"
	let nftContract: string = "KT1PuABq2ReD789KtKetktvVKJcCMpyDgwUx"
	let mtContract: string = "KT1DqmzJCkUQ8xAqeKzz9L4g4owLiQj87XaC"

	test("transfer NFT test", async () => {
		const mintResponse = await sdk.nft.mint({
			collectionId: toCollectionId(`TEZOS:${nftContract}`),
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

		const transfer = await sdk.nft.transfer({
			itemId: mintResult.itemId,
		})

		const result = await transfer.submit({
			to: toUnionAddress(`TEZOS:${recipient}`),
			amount: 1,
		})

		await result.wait()

		await awaitForOwnership(sdk, mintResult.itemId, recipient)
	}, 1500000)

	test("transfer MT test", async () => {
		const mintResponse = await sdk.nft.mint({
			collectionId: toCollectionId(`TEZOS:${mtContract}`),
		})
		const mintResult = await mintResponse.submit({
			uri: "ipfs://bafkreiaz7n5zj2qvtwmqnahz7rwt5h37ywqu7znruiyhwuav3rbbxzert4",
			supply: 10,
			lazyMint: false,
		})
		if (mintResult.type === MintType.ON_CHAIN) {
			await mintResult.transaction.wait()
		}
		await awaitForItemSupply(sdk, mintResult.itemId, "10")

		const transfer = await sdk.nft.transfer({
			itemId: mintResult.itemId,
		})
		const result = await transfer.submit({
			to: toUnionAddress(`TEZOS:${recipient}`),
			amount: 5,
		})
		await result.wait()

		await awaitForOwnership(sdk, mintResult.itemId, recipient)

	}, 1500000)

	test("transfer MT test with basic function", async () => {
		const mintResult = await sdk.nftBasic.mint({
			collectionId: toCollectionId(`TEZOS:${mtContract}`),
			uri: "ipfs://bafkreiaz7n5zj2qvtwmqnahz7rwt5h37ywqu7znruiyhwuav3rbbxzert4",
			supply: 10,
		})
		await mintResult.transaction.wait()
		await awaitForItemSupply(sdk, mintResult.itemId, "10")

		const transfer = await sdk.nftBasic.transfer({
			itemId: mintResult.itemId,
			to: toUnionAddress(`TEZOS:${recipient}`),
			amount: 5,
		})
		await transfer.wait()

		await awaitForOwnership(sdk, mintResult.itemId, recipient)

	}, 1500000)

})
