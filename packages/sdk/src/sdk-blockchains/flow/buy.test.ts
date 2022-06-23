import * as fcl from "@onflow/fcl"
import { FlowWallet } from "@rarible/sdk-wallet"
import { createFlowSdk } from "@rarible/flow-sdk"
import { FLOW_TESTNET_ACCOUNT_2 } from "@rarible/flow-test-common"
import { createApisSdk } from "../../common/apis"
import { retry } from "../../common/retry"
import { createTestFlowAuth } from "./test/create-test-flow-auth"
import { createTestItem } from "./test/create-test-item"
import { FlowMint } from "./mint"
import { sellItem } from "./test/sell-item"
import { FlowSell } from "./sell"
import { FlowBuy } from "./buy"
import { convertFlowUnionAddress } from "./common/converters"

describe("Flow buy", () => {
	const { authUser1 } = createTestFlowAuth(fcl)
	const wallet = new FlowWallet(fcl)
	const sdk = createFlowSdk(wallet.fcl, "staging", {}, authUser1)
	const apis = createApisSdk("staging")
	const mint = new FlowMint(sdk, apis, "testnet")
	const sell = new FlowSell(sdk, apis)
	const fill = new FlowBuy(sdk, apis, "testnet")

	test("Should buy flow NFT item", async () => {
		const itemId = await createTestItem(mint)
		const orderId = await sellItem(sell, itemId, "0.1")
		const order = await retry(20, 4000, () => apis.order.getOrderById({ id: orderId }))
		expect(order.take.value.toString()).toEqual("0.1")

		const originFees = [{ account: convertFlowUnionAddress(FLOW_TESTNET_ACCOUNT_2.address), value: 200 }]
		const prepareBuy = await fill.buy({ order })
		const tx = await prepareBuy.submit({ amount: 1, originFees })
		expect(tx.transaction.status).toEqual(4)
	})

	test("Should buy flow NFT item with basic function", async () => {
		const itemId = await createTestItem(mint)
		await retry(10, 2000, async () => {
			return apis.item.getItemById({ itemId })
		})

		console.log("before selling")
		const orderId = await sellItem(sell, itemId, "0.1")

		console.log("after selling")
		const order = await retry(20, 4000, () => apis.order.getOrderById({ id: orderId }))
		expect(order.take.value.toString()).toEqual("0.1")

		const originFees = [{ account: convertFlowUnionAddress(FLOW_TESTNET_ACCOUNT_2.address), value: 200 }]
		console.log("before buy")
		const tx = await fill.buyBasic({
			order,
			amount: 1,
			originFees,
		})
		expect(tx.transaction.status).toEqual(4)
	})
})
