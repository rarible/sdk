import * as fcl from "@onflow/fcl"
import { FlowWallet } from "@rarible/sdk-wallet"
import { createFlowSdk } from "@rarible/flow-sdk"
import { toBigNumber } from "@rarible/types"
import { createApisSdk } from "../../common/apis"
import { createTestFlowAuth } from "./test/create-test-flow-auth"
import { createTestItem } from "./test/create-test-item"
import { FlowMint } from "./mint"
import { testFlowToken } from "./test/common"
import { FlowBid } from "./bid"
import { FlowCancel } from "./cancel"
import { awaitFlowOrder } from "./test/await-order"
import { FlowBuy } from "./buy"

describe("Flow bid", () => {
	const { authUser1 } = createTestFlowAuth(fcl)
	const wallet = new FlowWallet(fcl)
	const sdk = createFlowSdk(wallet.fcl, "dev", {}, authUser1)
	const apis = createApisSdk("dev")
	const mint = new FlowMint(sdk, apis, "testnet")
	const bid = new FlowBid(sdk)
	const cancel = new FlowCancel(sdk, apis, "testnet")
	const acceptBid = new FlowBuy(sdk, apis, "testnet")

	test.skip("Should place a bid on flow NFT item, update bid and cancel bid ", async () => {
		const itemId = await createTestItem(mint)

		const bidPrepare = await bid.bid({ itemId })
		const orderId = await bidPrepare.submit({
			amount: 1,
			price: toBigNumber("0.1"),
			currency: {
				"@type": "FLOW_FT",
				contract: testFlowToken,
			},
		})

		const order = await awaitFlowOrder(sdk, orderId.split(":")[1])
		expect(order.take.value.toString()).toEqual("1")

		const prepare = await bid.update({ orderId })
		const updatedBidId = await prepare.submit({
			price: toBigNumber("0.2"),
		})

		const updatedOrder = await awaitFlowOrder(sdk, updatedBidId.split(":")[1])
		expect(updatedOrder.make.value.toString()).toEqual("0.2")

		await cancel.cancel({ orderId: updatedBidId })

		const cancelledOrder = await awaitFlowOrder(sdk, updatedBidId.split(":")[1])
		expect(cancelledOrder.status).toEqual("CANCELLED")
	}, 1000000)

	test.skip("Should place a bid on flow NFT item and accept bid", async () => {
		const itemId = await createTestItem(mint)

		const bidPrepare = await bid.bid({ itemId })
		const orderId = await bidPrepare.submit({
			amount: 1,
			price: toBigNumber("0.1"),
			currency: {
				"@type": "FLOW_FT",
				contract: testFlowToken,
			},
		})

		const prepare = await acceptBid.buy({ orderId })
		const acceptedOrderTx = await prepare.submit({ amount: 1 })
		expect(acceptedOrderTx).toBeTruthy()
	}, 1000000)
})
