import { Configuration, ItemControllerApi } from "@rarible/api-client"
import { toAddress, toBigNumber } from "@rarible/types"
import { getBasePathByEnv } from "../config/api-config"
import { checkLazyAssetType } from "./check-lazy-asset-type"
import { checkLazyAsset } from "./check-lazy-asset"

const client = new ItemControllerApi(
	new Configuration({
		basePath: getBasePathByEnv("dev-ethereum"),
	})
)
const partial = checkLazyAssetType.bind(null, client, 300500)

describe("checkLazyAsset", () => {
	test("if not found", async () => {
		const result = await checkLazyAsset(partial, {
			type: {
				"@type": "ERC721",
				contract: toAddress("0x0000000000000000000000000000000000000001"),
				tokenId: toBigNumber("100"),
			},
			value: toBigNumber("100"),
		})
		expect(result.type["@type"]).toBe("ERC721")
	})
})
