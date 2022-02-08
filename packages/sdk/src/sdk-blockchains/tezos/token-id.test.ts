import { toContractAddress, toUnionAddress } from "@rarible/types"
import { createRaribleSdk } from "../../index"
import { LogsLevel } from "../../domain"
import { createTestWallet } from "./test/test-wallet"

describe("test getting token id", () => {
	const wallet = createTestWallet("edsk3UUamwmemNBJgDvS8jXCgKsvjL2NoTwYRFpGSRPut4Hmfs6dG8")

	const sdk = createRaribleSdk(wallet, "dev", { logs: LogsLevel.DISABLED })

	let nftContract: string = "KT1SsPspRbf9rcNRMLEeXCgo85E6kHJSxi8m"

	test.skip("get tezos token id", async () => {

		const tokenId = await sdk.nft.generateTokenId({
			collection: toContractAddress(`TEZOS:${nftContract}`),
			minter: toUnionAddress("TEZOS:"),
		})

		if (tokenId) {
		  expect(tokenId.tokenId).toBe("2")
		}
	})
})
