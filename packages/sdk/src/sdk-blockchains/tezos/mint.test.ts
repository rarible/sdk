// eslint-disable-next-line camelcase
import { in_memory_provider } from "tezos-sdk-module/dist/providers/in_memory/in_memory_provider"
import BigNumber from "bignumber.js"
import { TezosWallet } from "@rarible/sdk-wallet"
import { toContractAddress, toUnionAddress } from "@rarible/types"
import { createRaribleSdk } from "../../index"
import { MintType } from "../../types/nft/mint/domain"
import { getTezosAPIs } from "./common"
import { createTezosSdk } from "./index"

describe("mint test", () => {
	const tezos = in_memory_provider(
		// "edskRzKnQB3jFrx8qYRedDguFNnrmePpvmAyBt6zTz1RzDm3vVnqtrqhhuM8SupK2gTYgq2jdMGJUgvMXJiG5Vz7Wd6Ub2hFTR",
		"edsk3UUamwmemNBJgDvS8jXCgKsvjL2NoTwYRFpGSRPut4Hmfs6dG8",
		"https://granada.tz.functori.com"
	)

	const config = {
		exchange: "KT1C5kWbfzASApxCMHXFLbHuPtnRaJXE4WMu",
		fees: new BigNumber(0),
		nft_public: "",
		mt_public: "",
	}

	const provider = {
		tezos,
		api: "https://rarible-api.functori.com/v0.1",
		config,
	}

	// const ethereum = new Web3Ethereum({ web3: web31 })
	const wallet = new TezosWallet(provider)
	const sdk = createRaribleSdk(wallet, "dev")
	const apis = getTezosAPIs("granada")

	//public nft contract
	// let fa2Contract: string = "KT1GTSXWyrBeNSxKqiHgkymFVujyu9JfHuKd"
	//private nft
	// let fa2Contract: string = "KT1W9tukr36yDyZjPk6CtpNW2uvnwpZeQSyF"
	let fa2Contract: string = "KT18ewjrhWB9ZZFYZkBACHxVEPuTtCg2eXPF"
	/*
  beforeAll(async () => {
		sender = await get_address(provider)
		// const op = await deploy_nft_public(
		// 	provider,
		// 	sender,
		// )
		const op = await deploy_nft_private(
			provider,
			sender
		)
		console.log("sender", sender)
		console.log("op", op)
		if (op.contract) {
			fa2Contract = op.contract
			console.log("fa2Contract", fa2Contract)
		}

		await op.confirmation()

	}, 1500000)
	 */

	test("mint test", async () => {

		// /*
		const mintResponse = await sdk.nft.mint({
			collectionId: toContractAddress(`TEZOS:${fa2Contract}`),
		})

		// console.log("mintResponse", mintResponse)
		const mintResult = await mintResponse.submit({
			uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
			supply: 1,
			lazyMint: false,
		})

		if (mintResult.type === MintType.ON_CHAIN) {
			await mintResult.transaction.wait()
		}
		console.log("minted", mintResult)


		// */
		// /*
		const item = await sdk.apis.item.getItemById({
			// itemId: mintResult.itemId,
			itemId: "TEZOS:KT18ewjrhWB9ZZFYZkBACHxVEPuTtCg2eXPF:10",
		})

		console.log("item", item)

		// */


	}, 1500000)

})
