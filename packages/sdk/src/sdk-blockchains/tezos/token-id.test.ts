// eslint-disable-next-line camelcase
import { in_memory_provider } from "tezos-sdk-module/dist/providers/in_memory/in_memory_provider"
import { TezosWallet } from "@rarible/sdk-wallet"
import { toUnionAddress } from "@rarible/types"
import { createRaribleSdk } from "../../index"

describe("test getting token id", () => {
	const tezos = in_memory_provider(
		"edsk3UUamwmemNBJgDvS8jXCgKsvjL2NoTwYRFpGSRPut4Hmfs6dG8",
		"https://hangzhou.tz.functori.com"
	)

	const wallet = new TezosWallet(tezos)
	const sdk = createRaribleSdk(wallet, "dev")

	let nftContract: string = "KT1SsPspRbf9rcNRMLEeXCgo85E6kHJSxi8m"

	test.skip("get tezos token id", async () => {

		const tokenId = await sdk.nft.generateTokenId({
			collection: toUnionAddress(`TEZOS:${nftContract}`),
			minter: toUnionAddress("TEZOS:"),
		})

		if (tokenId) {
		  expect(tokenId.tokenId).toBe("2")
		}
	})
})
