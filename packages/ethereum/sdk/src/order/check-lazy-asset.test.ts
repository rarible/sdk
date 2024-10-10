import { toEVMAddress, toBigNumber } from "@rarible/types"
import { getApis as getApisTemplate } from "../common/apis"
import { checkLazyAssetType } from "./check-lazy-asset-type"
import { checkLazyAsset } from "./check-lazy-asset"

const getApis = getApisTemplate.bind(null, undefined, "dev-ethereum")
const partial = checkLazyAssetType.bind(null, getApis)

describe("checkLazyAsset", () => {
  test("if not found", async () => {
    const result = await checkLazyAsset(partial, {
      assetType: {
        assetClass: "ERC721",
        contract: toEVMAddress("0x0000000000000000000000000000000000000001"),
        tokenId: toBigNumber("100"),
      },
      value: toBigNumber("100"),
    })
    expect(result.assetType.assetClass).toBe("ERC721")
  })
})
