import * as fcl from "@onflow/fcl"
import { FlowWallet } from "@rarible/sdk-wallet"
import { toOrderId, toUnionAddress } from "@rarible/types"
import { createTestFlowAuth } from "./test/create-test-flow-auth"
import { createFlowSdk } from "./index"

describe("test flow mint, order creation, and buy", () => {
	const { authUser1 } = createTestFlowAuth(fcl)
	const wallet1 = new FlowWallet(fcl, toUnionAddress("FLOW:"), "testnet")
	const sdk1 = createFlowSdk(wallet1, null as any, authUser1) //todo do not use createFlowSdk

	test.skip("Should cancel flow NFT order", async () => {
		const tx = await sdk1.order.cancel({ orderId: toOrderId("FLOW:14767115") })
		expect(tx).toBeTruthy()
	}, 1500000)
})
