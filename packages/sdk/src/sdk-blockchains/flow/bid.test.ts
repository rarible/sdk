import * as fcl from "@onflow/fcl"
import { FlowWallet } from "@rarible/sdk-wallet"
import { createFlowSdk } from "@rarible/flow-sdk"
import { toBigNumber } from "@rarible/types"
import { retry } from "../../common/retry"
import { createApisSdk } from "../../common/apis"
import { createTestFlowAuth } from "./test/create-test-flow-auth"
import { createTestItem } from "./test/create-test-item"
import { FlowMint } from "./mint"
import { testFlowToken } from "./test/common"
import { FlowBid } from "./bid"

describe("Flow bid", () => {
	const { authUser1 } = createTestFlowAuth(fcl)
	const wallet = new FlowWallet(fcl)
	const sdk = createFlowSdk(wallet.fcl, "dev", {}, authUser1)
	const apis = createApisSdk("dev")
	const mint = new FlowMint(sdk, apis, "testnet")
	const bid = new FlowBid(sdk)

	test("Should place a bid on flow NFT item and update bid", async () => {
		const itemId = await createTestItem(mint)

		const bidResponse = await bid.bid({ itemId })
		const orderId = await bidResponse.submit({
			amount: 1,
			price: toBigNumber("0.1"),
			currency: {
				"@type": "FLOW_FT",
				contract: testFlowToken,
			},
		})
		console.log("orderId", orderId)
		const order = await retry(10, 4000, () => sdk.apis.order.getOrderByOrderId({ orderId: orderId.split(":")[1] }))
		expect(order.take.value.toString()).toEqual("1")
		console.log("order", order)
		const prepare = await bid.update({ orderId })
		console.log("prepare", prepare)
		const updatedBidId = await prepare.submit({
			price: toBigNumber("0.2"),
		})
		console.log("updatedBidId", updatedBidId)
		const updatedOrder = await retry(10, 4000, async () => {
			const order = await sdk.apis.order.getOrderByOrderId({ orderId: updatedBidId.split(":")[1] })
			if (order.take.value.toString() !== "0.2") {
				throw new Error("Order is not updated yet")
			}
			return order
		})
		console.log("updatedOrder", updatedOrder)
		expect(updatedOrder.take.value.toString()).toEqual("0.2")
	}, 10000000)
})
