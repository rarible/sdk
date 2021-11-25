// eslint-disable-next-line camelcase
import { in_memory_provider } from "tezos-sdk-module/dist/providers/in_memory/in_memory_provider"
import { TezosWallet } from "@rarible/sdk-wallet"
import { toContractAddress } from "@rarible/types"
import BigNumber from "bignumber.js"
import { deploy_mt_public, deploy_nft_public } from "tezos-sdk-module"
import { createRaribleSdk } from "../../index"
import { MintType } from "../../types/nft/mint/domain"
import { retry } from "../../common/retry"

describe("sell test", () => {
	const tezos = in_memory_provider(
		"edsk3UUamwmemNBJgDvS8jXCgKsvjL2NoTwYRFpGSRPut4Hmfs6dG8",
		"https://granada.tz.functori.com",
	)
	const wallet = new TezosWallet(tezos)
	const sdk = createRaribleSdk(wallet, "dev")

	let nftContract: string = "KT19LS3JcWuYCfisq3dn1aVpuAV125akJ4t6"
	let mtContract: string = "KT1C8E4FosL6c9S3MKnkaK53onccAaHEuVYk"

	beforeAll(async () => {
		// "edskRzKnQB3jFrx8qYRedDguFNnrmePpvmAyBt6zTz1RzDm3vVnqtrqhhuM8SupK2gTYgq2jdMGJUgvMXJiG5Vz7Wd6Ub2hFTR",
		const provider = {
			tezos,
			api: "https://rarible-api.functori.com/v0.1",
			config: {
				exchange: "KT1C5kWbfzASApxCMHXFLbHuPtnRaJXE4WMu",
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

	test("sell NFT test", async () => {
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

		const sellAction = await sdk.order.sell({
			itemId: mintResult.itemId,
		})

		const orderId = await sellAction.submit({
			amount: 1,
			price: "0.000001",
			currency: {
				"@type": "XTZ",
			},
		})
		console.log("nft orderId", orderId)

	}, 1500000)

	test("sell MT test", async () => {
		const mintResponse = await sdk.nft.mint({
			collectionId: toContractAddress(`TEZOS:${mtContract}`),
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

		const sellAction = await sdk.order.sell({
			itemId: mintResult.itemId,
		})

		const orderId = await sellAction.submit({
			amount: 10,
			price: "0.000002",
			currency: {
				"@type": "XTZ",
			},
		})

		console.log("mt orderId", orderId)
	}, 1500000)

})
