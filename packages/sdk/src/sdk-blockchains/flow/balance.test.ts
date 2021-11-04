import { FlowWallet } from "@rarible/sdk-wallet"
import * as fcl from "@onflow/fcl"
import { toUnionAddress } from "@rarible/types"
import { createFlowSdk } from "./index"

describe("Test flow balance function", () => {
	beforeAll(() => {
		fcl.config().put("accessNode.api", "https://flow-access-mainnet.portto.io")
	})

	const wallet = new FlowWallet(fcl, toUnionAddress("FLOW:0x324c4173e0175672"))
	const sdk = createFlowSdk(wallet, null as any, "mainnet")

	test("Should get balance for account", async () => {
		const balance1 = await sdk.balances.getBalance(wallet.address, {
			"@type": "FLOW_FT",
			contract: toUnionAddress("FLOW:A.0x1654653399040a61.FlowToken"),
		})
		expect(balance1.toString()).toEqual("0.001")

		const balance2 = await sdk.balances.getBalance(wallet.address, {
			"@type": "FLOW_FT",
			contract: toUnionAddress("FLOW:A.0x3c5959b568896393.FUSD"),
		})
		expect(balance2.toString()).toEqual("0")
	})
})
