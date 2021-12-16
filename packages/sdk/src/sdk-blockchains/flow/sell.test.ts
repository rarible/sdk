import * as fcl from "@onflow/fcl"
import { FlowWallet } from "@rarible/sdk-wallet"
import { createFlowSdk } from "@rarible/flow-sdk"
import { toBigNumber } from "@rarible/types"
import { retry } from "../../common/retry"
import { createApisSdk } from "../../common/apis"
import { createTestFlowAuth } from "./test/create-test-flow-auth"
import { createTestItem } from "./test/create-test-item"
import { FlowMint } from "./mint"
import { sellItem } from "./test/sell-item"
import { FlowSell } from "./sell"

describe("Flow sell", () => {
	const { authUser1 } = createTestFlowAuth(fcl)
	const wallet = new FlowWallet(fcl)
	const sdk = createFlowSdk(wallet.fcl, "dev", {}, authUser1)
	const apis = createApisSdk("dev")
	const mint = new FlowMint(sdk, apis, "testnet")
	const sell = new FlowSell(sdk, apis)

	test.skip("Should sell flow NFT item and update order", async () => {
		const itemId = await createTestItem(mint)
		const orderId = await sellItem(sell, itemId, "0.1")
		const order = await retry(10, 4000, () => apis.order.getOrderById({ id: orderId }))
		expect(order.take.value.toString()).toEqual("0.1")
		const prepare = await sell.update({ orderId })
		const updatedOrderId = await prepare.submit({
			price: toBigNumber("0.2"),
		})
		const updatedOrder = await retry(10, 4000, async () => {
			const order = await apis.order.getOrderById({ id: updatedOrderId })
			if (order.take.value.toString() !== "0.2") {
				throw new Error("Order is not updated yet")
			}
			return order
		})
		expect(updatedOrder.take.value.toString()).toEqual("0.2")
	})
})
