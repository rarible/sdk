// eslint-disable-next-line camelcase
import { in_memory_provider } from "tezos-sdk-module/dist/providers/in_memory/in_memory_provider"
import { TezosWallet } from "@rarible/sdk-wallet"
import { toContractAddress } from "@rarible/types"
import { createRaribleSdk } from "../../index"
import { retry } from "../../common/retry"
import { MintType } from "../../types/nft/mint/domain"

describe("burn test", () => {
	const tezos = in_memory_provider(
		"edsk3UUamwmemNBJgDvS8jXCgKsvjL2NoTwYRFpGSRPut4Hmfs6dG8",
		"https://granada.tz.functori.com"
	)
	const wallet = new TezosWallet(tezos)
	const sdk = createRaribleSdk(wallet, "e2e")

	const nftContract: string = "KT1Q59huSmAo8a3veKjAvCiSYPw1XZwKKf8X"
	const mtContract: string = "KT1Gr347mFv4zfQUUgaGPb9SXjaU3MCRdrvr"

	test.skip("burn NFT token test", async () => {
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

		const transfer = await sdk.nft.burn({ itemId: mintResult.itemId })

		const result = await transfer.submit({ amount: 1 })

		if (result) {
		  await result.wait()
		}

		await retry(5, 500, async () => {
			await sdk.apis.item.getItemById({
				itemId: mintResult.itemId,
			})
		})
	}, 1500000)

	test.skip("burn MT token test", async () => {
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
		const transfer = await sdk.nft.burn({
			itemId: mintResult.itemId,
		})
		const result = await transfer.submit({ amount: 5 })
		if (result) {
		  await result.wait()
		}

		await retry(5, 500, async () => {
			await sdk.apis.item.getItemById({
				itemId: mintResult.itemId,
			})
		})
	}, 1500000)

})
