import * as fcl from "@onflow/fcl"
import { toContractAddress } from "@rarible/types"
import { convertFlowUnionAddress } from "./common/converters"
import { getSimpleFlowFungibleBalance } from "./balance-simple"

describe("Test flow simple balance function", () => {
	beforeAll(() => {
		fcl.config().put("accessNode.api", "https://flow-access-mainnet.portto.io")
	})

	const address = convertFlowUnionAddress("0x324c4173e0175672")

	test.skip("Should get balance for account", async () => {
		const balance1 = await getSimpleFlowFungibleBalance("mainnet", address, {
			"@type": "FLOW_FT",
			contract: toContractAddress("FLOW:A.0x1654653399040a61.FlowToken"),
		})
		expect(balance1.toString()).toEqual("0.001")

		const balance2 = await getSimpleFlowFungibleBalance("mainnet", address, {
			"@type": "FLOW_FT",
			contract: toContractAddress("FLOW:A.0x3c5959b568896393.FUSD"),
		})
		expect(balance2.toString()).toEqual("0")
	})
})
