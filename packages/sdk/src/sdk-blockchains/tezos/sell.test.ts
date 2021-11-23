// eslint-disable-next-line camelcase
import { in_memory_provider } from "tezos-sdk-module/dist/providers/in_memory/in_memory_provider"
import { TezosWallet } from "@rarible/sdk-wallet"
import { toItemId } from "@rarible/types"
import { createRaribleSdk } from "../../index"

describe("sell test", () => {
	const tezos = in_memory_provider(
		"edsk3UUamwmemNBJgDvS8jXCgKsvjL2NoTwYRFpGSRPut4Hmfs6dG8",
		"https://granada.tz.functori.com"
	)
	const wallet = new TezosWallet(tezos)
	const sdk = createRaribleSdk(wallet, "dev")

	let nftContract: string = "KT1Gr347mFv4zfQUUgaGPb9SXjaU3MCRdrvr"

	test.skip("sell test", async () => {

		const sellAction = await sdk.order.sell({
			itemId: toItemId(`TEZOS:${nftContract}:0`),
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
