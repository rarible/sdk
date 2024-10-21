import { toContractAddress, toUnionAddress } from "@rarible/types"
import type { RaribleSdkEnvironment } from "../../config/domain"
import { createSdk } from "../../common/test/create-sdk"
import { createTestWallet } from "./test/test-wallet"

describe.skip("test getting token id", () => {
  const env: RaribleSdkEnvironment = "testnet"
  const wallet = createTestWallet("edsk3UUamwmemNBJgDvS8jXCgKsvjL2NoTwYRFpGSRPut4Hmfs6dG8", env)

  const sdk = createSdk(wallet, env)

  let nftContract: string = "KT1EreNsT2gXRvuTUrpx6Ju4WMug5xcEpr43"

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
