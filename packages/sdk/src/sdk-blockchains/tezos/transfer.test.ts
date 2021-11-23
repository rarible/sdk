// eslint-disable-next-line camelcase
import { in_memory_provider } from "tezos-sdk-module/dist/providers/in_memory/in_memory_provider"
import { TezosWallet } from "@rarible/sdk-wallet"
import { toContractAddress, toUnionAddress } from "@rarible/types"
import { createRaribleSdk } from "../../index"
import { MintType } from "../../types/nft/mint/domain"
import { retry } from "../../common/retry"

describe("transfer test", () => {
	const tezos = in_memory_provider(
		"edsk3UUamwmemNBJgDvS8jXCgKsvjL2NoTwYRFpGSRPut4Hmfs6dG8",
		"https://granada.tz.functori.com"
	)

	const wallet = new TezosWallet(tezos)
	const sdk = createRaribleSdk(wallet, "e2e")

	const receipent = "tz1VXxRfyFHoPXBVUrWY5tsa1oWevrgChhSg"
	const nftContract: string = "KT1Q59huSmAo8a3veKjAvCiSYPw1XZwKKf8X"
	const mtContract: string = "KT1Gr347mFv4zfQUUgaGPb9SXjaU3MCRdrvr"

	test.skip("transfer NFT test", async () => {
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
		await retry(5, 500, async () => {
			await sdk.apis.item.getItemById({
				itemId: mintResult.itemId,
			})
		})

		const transfer = await sdk.nft.transfer({
			itemId: mintResult.itemId,
		})

		const result = await transfer.submit({
			to: toUnionAddress(`TEZOS:${receipent}`),
			amount: 1,
		})

		await result.wait()

		await retry(5, 500, async () => {
			const ownership = await sdk.apis.ownership.getOwnershipById({
				ownershipId: `${mintResult.itemId}:${receipent}`,
			})
			if (ownership.value !== "1") {
				throw new Error("Ownership value is not correct")
			}
		})
	}, 1500000)

	test.skip("transfer MT test", async () => {

		const mintResponse = await sdk.nft.mint({
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
		await retry(5, 500, async () => {
			await sdk.apis.item.getItemById({
				itemId: mintResult.itemId,
			})
		})

		const transfer = await sdk.nft.transfer({
			itemId: mintResult.itemId,
		})
		const result = await transfer.submit({
			to: toUnionAddress(`TEZOS:${receipent}`),
			amount: 5,
		})
		await result.wait()

		await retry(5, 500, async () => {
			const ownership = await sdk.apis.ownership.getOwnershipById({
				ownershipId: `${mintResult.itemId}:${receipent}`,
			})
			if (ownership.value !== "5") {
				throw new Error("Ownership value is not correct")
			}
		})

	}, 1500000)

})
