// eslint-disable-next-line camelcase
import { in_memory_provider } from "tezos-sdk-module/dist/providers/in_memory/in_memory_provider"
// eslint-disable-next-line camelcase
import { get_address } from "tezos-sdk-module/dist/common/base"
import BigNumber from "bignumber.js"
import { TezosWallet } from "@rarible/sdk-wallet"
import { toItemId, toUnionAddress } from "@rarible/types"
import { createRaribleSdk } from "../../index"
import { MintType } from "../../types/nft/mint/domain"
import { retry } from "../../common/retry"
import { getTezosAPIs, getTezosItemData } from "./common"

describe("transfer test", () => {
	const tezos = in_memory_provider(
		"edsk3UUamwmemNBJgDvS8jXCgKsvjL2NoTwYRFpGSRPut4Hmfs6dG8",
		"https://granada.tz.functori.com"
	)

	const config = {
		exchange: "KT1XgQ52NeNdjo3jLpbsPBRfg8YhWoQ5LB7g",
		fees: new BigNumber(0),
		nft_public: "",
		mt_public: "",
	}

	const provider = {
		tezos,
		api: "https://rarible-api.functori.com/v0.1/",
		config,
	}
	const wallet = new TezosWallet(provider)
	const sdk = createRaribleSdk(wallet, "e2e")
	const tezosAPI = getTezosAPIs("granada")

	const receipent = "tz1VXxRfyFHoPXBVUrWY5tsa1oWevrgChhSg"
	const fa2Contract: string = "KT18ewjrhWB9ZZFYZkBACHxVEPuTtCg2eXPF"

	test("transfer test", async () => {
		const sender = await get_address(provider)
		console.log("sender", sender)

		/*
		const mintResponse = await sdk.nft.mint({
			collectionId: toUnionAddress(`TEZOS:${fa2Contract}`),
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

     */
		const transferedId = toItemId("TEZOS:KT18ewjrhWB9ZZFYZkBACHxVEPuTtCg2eXPF:7")
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
				ownershipId: `${itemId}:${sender}`,
			})

			console.log("ownership", ownership)

		})
	}, 1500000)

})
