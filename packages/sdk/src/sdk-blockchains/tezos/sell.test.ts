// eslint-disable-next-line camelcase
import { in_memory_provider } from "tezos-sdk-module/dist/providers/in_memory/in_memory_provider"
import BigNumber from "bignumber.js"
import { TezosWallet } from "@rarible/sdk-wallet"
import { toContractAddress, toItemId, toUnionAddress } from "@rarible/types"
import { get_address } from "tezos-sdk-module/dist/common/base"
import { deploy_nft_public } from "tezos-sdk-module"
import { createRaribleSdk } from "../../index"
import { MintType } from "../../types/nft/mint/domain"
import { retry } from "../../common/retry"
import { getTezosAPIs } from "./common"
import { createTezosSdk } from "./index"

describe("mint test", () => {
	const tezos = in_memory_provider(
		// "edskRzKnQB3jFrx8qYRedDguFNnrmePpvmAyBt6zTz1RzDm3vVnqtrqhhuM8SupK2gTYgq2jdMGJUgvMXJiG5Vz7Wd6Ub2hFTR",
		"edsk3UUamwmemNBJgDvS8jXCgKsvjL2NoTwYRFpGSRPut4Hmfs6dG8",
		"https://granada.tz.functori.com"
	)

	// const ethereum = new Web3Ethereum({ web3: web31 })
	const wallet = new TezosWallet(tezos)
	const sdk = createRaribleSdk(wallet, "dev")
	const apis = getTezosAPIs("granada")

	//public nft contract
	// let fa2Contract: string = "KT1GTSXWyrBeNSxKqiHgkymFVujyu9JfHuKd"
	//private nft
	// let fa2Contract: string = "KT1W9tukr36yDyZjPk6CtpNW2uvnwpZeQSyF"
	// let fa2Contract: string = "KT18ewjrhWB9ZZFYZkBACHxVEPuTtCg2eXPF"
	// let fa2Contract: string = "KT1CmToUtdR59uxNaoWRJcxfH8rH7cjgEr53"
	let ftContract: string = "KT1Gr347mFv4zfQUUgaGPb9SXjaU3MCRdrvr"
	/*
  beforeAll(async () => {
    const sender = await get_address(provider)
    const op = await deploy_nft_public(
      provider,
      sender,
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

		/*
		const mintResponse = await sdk.nft.mint({
			collectionId: toContractAddress(`TEZOS:${fa2Contract}`),
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

		await retry(5, 500, async () => {
			const item = await sdk.apis.item.getItemById({
				itemId: mintResult.itemId,
				// itemId: "TEZOS:KT1CmToUtdR59uxNaoWRJcxfH8rH7cjgEr53:2",
			})

			console.log("item", item)
		})

		*/

		const sellAction = await sdk.order.sell({
			itemId: toItemId(`TEZOS:${ftContract}:0`),
		})

		try {
			const orderId = await sellAction.submit({
				amount: 1,
				price: "2",
				currency: {
					"@type": "XTZ",
				},
			})
		  console.log("orderId", orderId)
		} catch (e) {
			console.error(await (e as any).json())
		}

	}, 1500000)

})
