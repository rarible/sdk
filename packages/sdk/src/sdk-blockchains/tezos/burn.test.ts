// eslint-disable-next-line camelcase
import { in_memory_provider } from "tezos-sdk-module/dist/providers/in_memory/in_memory_provider"
import BigNumber from "bignumber.js"
// eslint-disable-next-line camelcase
import { EthereumWallet, TezosWallet } from "@rarible/sdk-wallet"
import type { ItemId } from "@rarible/api-client"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import { get_address } from "tezos-sdk-module/dist/common/base"
import { toContractAddress, toItemId } from "@rarible/types"
import { deploy_mt_private, deploy_mt_public } from "tezos-sdk-module"
import { initProviders } from "../ethereum/test/init-providers"
import { createRaribleSdk } from "../../index"
import { retry } from "../../common/retry"
import { MintType } from "../../types/nft/mint/domain"
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

	let nftContract: string = "KT1CmToUtdR59uxNaoWRJcxfH8rH7cjgEr53"
	let mtContract: string = "KT1Gr347mFv4zfQUUgaGPb9SXjaU3MCRdrvr"

	/*
	beforeAll(async () => {
		const sender = await tezos.address()
		const op = await deploy_mt_public(
			{
				tezos,
				api: "https://rarible-api.functori.com/v0.1",
				config: {
					exchange: "KT1C5kWbfzASApxCMHXFLbHuPtnRaJXE4WMu",
					fees: new BigNumber(0),
					nft_public: "",
					mt_public: "",
				},
			},
			sender,
		)

		console.log("sender", sender)
		console.log("op", op)
		if (op.contract) {
			ftContract = op.contract
			console.log("ft contract", ftContract)
		}

		await op.confirmation()

	}, 1500000)

	*/

	/*
	test("burn NFT token test", async () => {
		const sender = await tezos.address

		// /*
		const mintResponse = await sdk.nft.mint({
			collectionId: toContractAddress(`TEZOS:${nftContract}`),
		})

		// console.log("mintResponse", mintResponse)
		const mintResult = await mintResponse.submit({
			// uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
			// uri: "ipfs://ipfs/QmWLsBu6nS4ovaHbGAXprD1qEssJu4r5taQfB74sCG51tp",
			uri: "ipfs://bafkreiaz7n5zj2qvtwmqnahz7rwt5h37ywqu7znruiyhwuav3rbbxzert4",
			supply: 1,
			lazyMint: false,
		})

		if (mintResult.type === MintType.ON_CHAIN) {
			await mintResult.transaction.wait()
		}
		console.log("minted", mintResult)


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


   */
	test("burn FT token test", async () => {
		const sender = await tezos.address

		// /*
		const mintResponse = await sdk.nft.mint({
			collectionId: toContractAddress(`TEZOS:${mtContract}`),
		})

		// console.log("mintResponse", mintResponse)
		const mintResult = await mintResponse.submit({
			// uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
			// uri: "ipfs://ipfs/QmWLsBu6nS4ovaHbGAXprD1qEssJu4r5taQfB74sCG51tp",
			uri: "ipfs://bafkreiaz7n5zj2qvtwmqnahz7rwt5h37ywqu7znruiyhwuav3rbbxzert4",
			supply: 10,
			lazyMint: false,
		})

		if (mintResult.type === MintType.ON_CHAIN) {
			await mintResult.transaction.wait()
		}
		console.log("minted", mintResult)


		const transfer = await sdk.nft.burn({
			itemId: mintResult.itemId,
		})

		const result = await transfer.submit({ amount: 5 })

		if (result) {
		  await result.wait()
		}

		await retry(5, 500, async () => {
			const item = await tezosAPI.item.getNftItemById({
				// ownershipId: `${fa2Contract}:${mintResult.itemId}:${sender}`,
				itemId: mintResult.itemId,
			})

			console.log("item", item)

		})
	}, 1500000)

})
