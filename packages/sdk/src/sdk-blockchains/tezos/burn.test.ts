// eslint-disable-next-line camelcase
import { in_memory_provider } from "tezos-sdk-module/dist/providers/in_memory/in_memory_provider"
import BigNumber from "bignumber.js"
// eslint-disable-next-line camelcase
import { EthereumWallet } from "@rarible/sdk-wallet"
import type { ItemId } from "@rarible/api-client"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import { initProviders } from "../ethereum/test/init-providers"
import { createRaribleSdk } from "../../index"

describe("burn test", () => {
	const { web31 } = initProviders()

	const ethereum = new Web3Ethereum({ web3: web31 })
	const wallet = new EthereumWallet(ethereum)
	const sdk = createRaribleSdk(wallet, "e2e")

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

	const sender = "tz1dGYcxgScHNkVWdpDKAwuP2xc5afnutjL3"
	const receipent = "tz1VXxRfyFHoPXBVUrWY5tsa1oWevrgChhSg"
	let fa2Contract: string = "KT1ChRn258Xwy1wnFMYrU9kFQrDxfJnFm68M"
	const royaltiesContract: string = "KT1KrzCSQs6XMMRsQ7dqCVcYQeGs7d512zzb"
	let itemId: ItemId

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

		const transfer = await sdk.nft.burn({ itemId })

		const result = await transfer.submit({ amount: 1 })

		if (result) {
		  await result.wait()
		}

	}, 1500000)

})
