// eslint-disable-next-line camelcase
import { in_memory_provider } from "tezos-sdk-module/dist/providers/in_memory/in_memory_provider"
import BigNumber from "bignumber.js"
// eslint-disable-next-line camelcase
import { EthereumWallet, TezosWallet } from "@rarible/sdk-wallet"
import type { ItemId } from "@rarible/api-client"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import { get_address } from "tezos-sdk-module/dist/common/base"
import { toItemId } from "@rarible/types"
import { initProviders } from "../ethereum/test/init-providers"
import { createRaribleSdk } from "../../index"
import { retry } from "../../common/retry"
import { getTezosAPIs } from "./common"

describe("burn test", () => {
	const tezos = in_memory_provider(
		// "edskRzKnQB3jFrx8qYRedDguFNnrmePpvmAyBt6zTz1RzDm3vVnqtrqhhuM8SupK2gTYgq2jdMGJUgvMXJiG5Vz7Wd6Ub2hFTR",
		"edsk3UUamwmemNBJgDvS8jXCgKsvjL2NoTwYRFpGSRPut4Hmfs6dG8",
		"https://granada.tz.functori.com"
	)

	const wallet = new TezosWallet(tezos)
	const sdk = createRaribleSdk(wallet, "dev")
	const tezosAPI = getTezosAPIs("granada")

	let fa2Contract: string = "KT1CmToUtdR59uxNaoWRJcxfH8rH7cjgEr53"
	let itemId: ItemId = toItemId("TEZOS:KT1CmToUtdR59uxNaoWRJcxfH8rH7cjgEr53:1")

	/*
	beforeAll(async () => {
		const op = await deploy_fa2(
			provider,
			sender,
			royaltiesContract
		)
		console.log("op", op)
		if (op.contract) {
			fa2Contract = op.contract
			console.log("fa2Contract", fa2Contract)
		}

		await op.confirmation()

		const mintResponse = await sdk.nft.mint({
			collectionId: toUnionAddress(`TEZOS:${fa2Contract}`),
		})

		const mintResult = await mintResponse.submit({
			uri: "",
			supply: 10,
			lazyMint: false,
		})

		itemId = mintResult.itemId

		if (mintResult.type === MintType.ON_CHAIN) {
			await mintResult.transaction.wait()
		}
	}, 1500000)

   */

	test("burn test", async () => {
		const sender = await tezos.address

		const transfer = await sdk.nft.burn({ itemId })

		const result = await transfer.submit({ amount: 1 })

		if (result) {
		  await result.wait()
		}

		await retry(5, 500, async () => {
			const item = await tezosAPI.item.getNftItemById({
				// ownershipId: `${fa2Contract}:${mintResult.itemId}:${sender}`,
				itemId,
			})

			console.log("item", item)

		})
	}, 1500000)

})
