// eslint-disable-next-line camelcase
import { in_memory_provider } from "tezos-sdk-module/dist/providers/in_memory/in_memory_provider"
import { TezosWallet } from "@rarible/sdk-wallet"
import { toContractAddress } from "@rarible/types"
import BigNumber from "bignumber.js"
import { deploy_mt_public, deploy_nft_public } from "tezos-sdk-module"
import { createRaribleSdk } from "../../index"
import { MintType } from "../../types/nft/mint/domain"
import { retry } from "../../common/retry"
import { awaitForItemSupply } from "./test/await-for-item-supply"

describe("mint test", () => {
	const tezos = in_memory_provider(
		"edsk4CmgW9r4fwqtsT6x2bB7BdVcERxLPt6poFXGpk1gTKbqR43G5H",
		"https://hangzhou.tz.functori.com"
	)

	const wallet = new TezosWallet(tezos)
	const sdk = createRaribleSdk(wallet, "dev")

	let nftContract: string = "KT1AKaFH5RbfuYe1Bh87pyjpfyWKnsNHZUdw"
	let mtContract: string = "KT1P5vXgMGKrdxVdw2dZHUrXGmsRw6neceMh"

	/*
	beforeAll(async () => {
		// "edskRzKnQB3jFrx8qYRedDguFNnrmePpvmAyBt6zTz1RzDm3vVnqtrqhhuM8SupK2gTYgq2jdMGJUgvMXJiG5Vz7Wd6Ub2hFTR",
		const provider = {
			tezos: tezos,
			api: "https://rarible-api.functori.com/v0.1",
			config: {
				exchange: "KT1KkUufmRPjK6SBNZVvAYniAY5F9czYmgwu",
				fees: new BigNumber(0),
				nft_public: "",
				mt_public: "",
			},
		}
		const sender = await tezos.address()
		console.log("sender", sender)
		const nft = await deploy_nft_public(provider, sender)
		console.log("nft", nft.contract)
		await nft.confirmation()
		nftContract = nft.contract as string


		const mt = await deploy_mt_public(provider, sender)
		await mt.confirmation()
		mtContract = mt.contract as string
		console.log("mt", mt.contract)
	})

   */

	test.skip("mint NFT token test", async () => {
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
	}, 1500000)


	test("mint MT token test", async () => {
		const mintResponse = await sdk.nft.mint({
			collectionId: toContractAddress(`TEZOS:${mtContract}`),
		})
		const mintResult = await mintResponse.submit({
			uri: "ipfs://bafkreiaz7n5zj2qvtwmqnahz7rwt5h37ywqu7znruiyhwuav3rbbxzert4",
			supply: 12,
			lazyMint: false,
		})
		if (mintResult.type === MintType.ON_CHAIN) {
			await mintResult.transaction.wait()
		}
		await awaitForItemSupply(sdk, mintResult.itemId, "10")

	}, 1500000)

})
