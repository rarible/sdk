// eslint-disable-next-line camelcase
import { TezosWallet } from "@rarible/sdk-wallet"
import { toContractAddress } from "@rarible/types"
import BigNumber from "bignumber.js"
import { deploy_mt_public, deploy_nft_public } from "tezos-sdk-module"
import { createRaribleSdk } from "../../index"
import { retry } from "../../common/retry"
import { MintType } from "../../types/nft/mint/domain"
import { awaitForItemSupply } from "./test/await-for-item-supply"
import { createTestInMemoryProvider } from "./test/create-in-memory-provider"

describe("burn test", () => {
	const tezos = createTestInMemoryProvider("edsk3UUamwmemNBJgDvS8jXCgKsvjL2NoTwYRFpGSRPut4Hmfs6dG8")
	const wallet = new TezosWallet(tezos)
	const sdk = createRaribleSdk(wallet, "dev")

	let nftContract: string = "KT1HfLByoDk22vZp3GtgMM1oNUjeYQEgeEYS"
	let mtContract: string = "KT1A4wrudnhHSgayCi9U9DB3MyaSTd3wpFYy"

	/*
	beforeAll(async () => {
		const provider = {
			tezos,
			api: "https://rarible-api.functori.com/v0.1",
			config: {
				exchange: "KT1AguExF32Z9UEKzD5nuixNmqrNs1jBKPT8",
				fees: new BigNumber(0),
				nft_public: "",
				mt_public: "",
			},
		}
		const sender = await tezos.address()
		console.log("sender", sender)
		const mt = await deploy_nft_public(provider, sender)
		console.log("nft", mt.contract)
		nftContract = mt.contract as any
		await mt.confirmation()
	})

   */

	test("burn NFT token test", async () => {
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

		const transfer = await sdk.nft.burn({ itemId: mintResult.itemId })

		const result = await transfer.submit({ amount: 1 })

		if (result) {
		  await result.wait()
		}

		await awaitForItemSupply(sdk, mintResult.itemId, "0")
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

		await awaitForItemSupply(sdk, mintResult.itemId, "10")

		const transfer = await sdk.nft.burn({
			itemId: mintResult.itemId,
		})
		const result = await transfer.submit({ amount: 5 })
		if (result) {
		  await result.wait()
		}

		await awaitForItemSupply(sdk, mintResult.itemId, "5")
	}, 1500000)

})
