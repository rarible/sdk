import { FlowWallet } from "@rarible/sdk-wallet"
import * as fcl from "@onflow/fcl"
import { toContractAddress, toCurrencyId } from "@rarible/types"
import { createApisSdk } from "../../common/apis"
import { convertFlowUnionAddress } from "./common/converters"
import { createFlowSdk } from "./index"

describe("Test flow balance function", () => {
	beforeAll(() => {
		fcl.config().put("accessNode.api", "https://flow-access-mainnet.portto.io")
	})

	const address = convertFlowUnionAddress("0x324c4173e0175672")
	const wallet = new FlowWallet(fcl)
	const sdk = createFlowSdk(wallet, createApisSdk("prod"), "mainnet")

	test.skip("Should get FT balance for account", async () => {
		const balance1 = await sdk.balances.getBalance(address, {
			"@type": "FLOW_FT",
			contract: toContractAddress("FLOW:A.0x1654653399040a61.FlowToken"),
		})
		expect(balance1.toString()).toEqual("0.001")

		const balance2 = await sdk.balances.getBalance(address, {
			"@type": "FLOW_FT",
			contract: toContractAddress("FLOW:A.0x3c5959b568896393.FUSD"),
		})
		expect(balance2.toString()).toEqual("0")
	})

	test.skip("Should get FT balance for account with CurrencyId", async () => {
		const balance1 = await sdk.balances.getBalance(
			address,
			toCurrencyId("FLOW:A.0x1654653399040a61.FlowToken")
		)
		expect(balance1.toString()).toEqual("0.001")

		const balance2 = await sdk.balances.getBalance(
			address,
			toCurrencyId("FLOW:A.0x3c5959b568896393.FUSD")
		)
		expect(balance2.toString()).toEqual("0")
	})
})
