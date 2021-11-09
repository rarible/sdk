// eslint-disable-next-line camelcase
import { in_memory_provider } from "tezos-sdk-module/dist/providers/in_memory/in_memory_provider"
import BigNumber from "bignumber.js"
// eslint-disable-next-line camelcase
import { deploy_fa2, mint } from "tezos-sdk-module"
import { TezosWallet } from "@rarible/sdk-wallet"
import { Configuration, ItemControllerApi } from "@rarible/api-client"
import { createTezosSdk } from "./index"

describe("bid test", () => {
	const tezos = in_memory_provider(
		"edskRzKnQB3jFrx8qYRedDguFNnrmePpvmAyBt6zTz1RzDm3vVnqtrqhhuM8SupK2gTYgq2jdMGJUgvMXJiG5Vz7Wd6Ub2hFTR",
		// "edsk3UUamwmemNBJgDvS8jXCgKsvjL2NoTwYRFpGSRPut4Hmfs6dG8",
		"https://granada.tz.functori.com"
	)

	const config = {
		exchange: "KT1XgQ52NeNdjo3jLpbsPBRfg8YhWoQ5LB7g",
		fees: new BigNumber(0),
	}

	const provider = {
		tezos,
		api: "https://rarible-api.functori.com/v0.1/",
		config,
	}

	// let fa2Contract: string = "KT1ALMMH2iiz6iSEPySjDYMjJJF24yqFHVyi"
	const sender = "tz1dGYcxgScHNkVWdpDKAwuP2xc5afnutjL3"
	// let fa2Contract: string = "KT1ChRn258Xwy1wnFMYrU9kFQrDxfJnFm68M"
	// let fa2Contract: string = "KT1AEQ9ZzQuhXKfkzDXrWEq4hHS4Ff72CEQU"
	let fa2Contract: string = "KT1ChRn258Xwy1wnFMYrU9kFQrDxfJnFm68M"
	const royaltiesContract: string = "KT1KrzCSQs6XMMRsQ7dqCVcYQeGs7d512zzb"
	// const royaltiesContract: string = "KT1Ufrrbhq15UmQ5Yr11kJ4ZwSH5VuZ6xz71"

	// const sdkPath = "https://api-e2e.rarible.org"
	const sdkPath = "https://api-dev.rarible.org"
	// const sdkPath = "https://api-staging.rarible.org"
	const configuration = new Configuration({ basePath: sdkPath })
	// const itemController = new ItemControllerApi(configuration)

	const wallet = new TezosWallet(provider)
	const sdk = createTezosSdk(wallet)
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

		const conf = await op.confirmation()

	}, 1500000)

   */


	/*
	test("as", async () => {
		const item = await itemController.getItemById({
			itemId: `TEZOS:${fa2Contract}:102`,
		})
		console.log("item", item)
	})

   */

	/*
	test("bid test", async () => {
		const tx = await mint(
			provider,
			fa2Contract,
			{},
			new BigNumber(100),
			new BigNumber(101),
			{},
		)
		if (tx.token_id) {
		  console.log("mint token id=", tx.token_id.toString())
		}


		// await sdk.order.bid({ itemId: `TEZOS:${fa2Contract}:101` as any })
	}, 1500000)


   */
})
