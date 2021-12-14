import { toContractAddress, toUnionAddress } from "@rarible/types"
import { createRaribleSdk } from "../../index"
import { MintType } from "../../types/nft/mint/domain"
import { createTestWallet } from "./test/test-wallet"
import { awaitForOwnership } from "./test/await-for-ownership"
import { awaitForItemSupply } from "./test/await-for-item-supply"

describe("transfer test", () => {
	const wallet = createTestWallet("edsk3UUamwmemNBJgDvS8jXCgKsvjL2NoTwYRFpGSRPut4Hmfs6dG8")
	const sdk = createRaribleSdk(wallet, "dev")

	const receipent = "tz1VXxRfyFHoPXBVUrWY5tsa1oWevrgChhSg"
	let nftContract: string = "KT1Ctz9vuC6uxsBPD4GbdbPaJvZogWhE9SLu"
	let mtContract: string = "KT1BMB8m1QKqbbDDZPXpmGVCaM1cGcpTQSrw"

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

		await awaitForItemSupply(sdk, mintResult.itemId, "1")

		const transfer = await sdk.nft.transfer({
			itemId: mintResult.itemId,
		})

		const result = await transfer.submit({
			to: toUnionAddress(`TEZOS:${receipent}`),
			amount: 1,
		})

		await result.wait()

		await awaitForOwnership(sdk, mintResult.itemId, receipent)
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
		await awaitForItemSupply(sdk, mintResult.itemId, "10")

		const transfer = await sdk.nft.transfer({
			itemId: mintResult.itemId,
		})
		const result = await transfer.submit({
			to: toUnionAddress(`TEZOS:${receipent}`),
			amount: 5,
		})
		await result.wait()

		console.log("mintResult.itemId", mintResult.itemId, receipent)
		await awaitForOwnership(sdk, mintResult.itemId, receipent)

	}, 1500000)

})
