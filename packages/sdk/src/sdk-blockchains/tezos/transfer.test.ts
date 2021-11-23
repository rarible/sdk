// eslint-disable-next-line camelcase
import { in_memory_provider } from "tezos-sdk-module/dist/providers/in_memory/in_memory_provider"
// eslint-disable-next-line camelcase
import { get_address } from "tezos-sdk-module/dist/common/base"
import BigNumber from "bignumber.js"
import { TezosWallet } from "@rarible/sdk-wallet"
import { toContractAddress, toItemId, toUnionAddress } from "@rarible/types"
import { createRaribleSdk } from "../../index"
import { MintType } from "../../types/nft/mint/domain"
import { retry } from "../../common/retry"
import { getTezosAPIs, getTezosItemData } from "./common"

describe("transfer test", () => {
	const tezos = in_memory_provider(
		"edsk3UUamwmemNBJgDvS8jXCgKsvjL2NoTwYRFpGSRPut4Hmfs6dG8",
		"https://granada.tz.functori.com"
	)

	const wallet = new TezosWallet(tezos)
	const sdk = createRaribleSdk(wallet, "dev")
	const tezosAPI = getTezosAPIs("granada")

	const receipent = "tz1VXxRfyFHoPXBVUrWY5tsa1oWevrgChhSg"
	const nftContract: string = "KT1CmToUtdR59uxNaoWRJcxfH8rH7cjgEr53"
	const mtContract: string = "KT1Gr347mFv4zfQUUgaGPb9SXjaU3MCRdrvr"

	test("transfer test", async () => {
		const sender = await tezos.address
		console.log("sender", sender)

		const mintResponse = await sdk.nft.mint({
			collectionId: toContractAddress(`TEZOS:${nftContract}`),
		})

		const mintResult = await mintResponse.submit({
			uri: "",
			supply: 1,
			lazyMint: false,
		})
		if (mintResult.type === MintType.ON_CHAIN) {
			await mintResult.transaction.wait()
		}

		console.log("minted item", mintResult)
		// const transferedId = mintResult.itemId

		await retry(5, 500, async () => {
			const item = await tezosAPI.item.getNftItemById({
				// ownershipId: `${fa2Contract}:${mintResult.itemId}:${sender}`,
				itemId,
			})

			console.log("item", item)
		})

		const transferedId = toItemId("TEZOS:KT1CmToUtdR59uxNaoWRJcxfH8rH7cjgEr53:7")
		// const transferedId = mintResult.itemId
		const transfer = await sdk.nft.transfer({
			// itemId: mintResult.itemId,
			itemId: toItemId(transferedId),
		})

		const result = await transfer.submit({
			to: toUnionAddress(`TEZOS:${receipent}`),
			amount: 1,
		})

		await result.wait()

		const { itemId } = getTezosItemData(transferedId)
		await retry(5, 500, async () => {
			const ownership = await sdk.apis.ownership.getOwnershipById({
				// ownershipId: `${fa2Contract}:${mintResult.itemId}:${sender}`,
				ownershipId: `${itemId}:${receipent}`,
			})

			console.log("ownership", ownership)

		})
	}, 1500000)

	test("transfer MT test", async () => {
		const sender = await tezos.address
		console.log("sender", sender)

		const mintResponse = await sdk.nft.mint({
			collectionId: toContractAddress(`TEZOS:${mtContract}`),
		})

		// console.log("mintResponse", mintResponse)
		const mintResult = await mintResponse.submit({
			uri: "",
			supply: 1,
			lazyMint: false,
		})
		if (mintResult.type === MintType.ON_CHAIN) {
			await mintResult.transaction.wait()
		}

		console.log("minted item", mintResult)
		// const transferedId = mintResult.itemId

		await retry(5, 500, async () => {
			const item = await tezosAPI.item.getNftItemById({
				// ownershipId: `${fa2Contract}:${mintResult.itemId}:${sender}`,
				itemId,
			})

			console.log("item", item)
		})

		const transferedId = toItemId("TEZOS:KT1CmToUtdR59uxNaoWRJcxfH8rH7cjgEr53:7")
		// const transferedId = mintResult.itemId
		const transfer = await sdk.nft.transfer({
			// itemId: mintResult.itemId,
			itemId: toItemId(transferedId),
		})

		const result = await transfer.submit({
			to: toUnionAddress(`TEZOS:${receipent}`),
			amount: 1,
		})

		await result.wait()

		const { itemId } = getTezosItemData(transferedId)
		await retry(5, 500, async () => {
			const ownership = await tezosAPI.ownership.getNftOwnershipById({
				// ownershipId: `${fa2Contract}:${mintResult.itemId}:${sender}`,
				ownershipId: `${itemId}:${receipent}`,
			})

			console.log("ownership", ownership)

		})
	}, 1500000)

})
