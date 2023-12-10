import { toAddress, toBigNumber } from "@rarible/types"
import { getEthereumConfig } from "../../../config"
import type { EthereumNetwork } from "../../../types"
import { createEthereumApis } from "../../../common/apis"
import { getAPIKey } from "../../../common/balances.test"
import { getAmmItemsRoyalties } from "./get-market-data"

describe("get maret data", () => {
	const env: EthereumNetwork = "dev-ethereum"
	const config = getEthereumConfig(env)
	const apis = createEthereumApis(env, { apiKey: getAPIKey(env) })

	test("getAmmItemsRoyalties", async () => {
		const royalties = await getAmmItemsRoyalties(apis, config, {
			assetType: {
				"@type": "ERC721",
				contract: toAddress("0x6972347e66a32f40ef3c012615c13cb88bf681cc"),
				tokenId: toBigNumber("89600346181561266007348051519878822320245810738073457278779091149096524709889"),
			},
		})
		console.log("royalties", royalties)
	})
})
