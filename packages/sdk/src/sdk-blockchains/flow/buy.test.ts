import * as fcl from "@onflow/fcl"
import { FlowWallet } from "@rarible/sdk-wallet"
import { createFlowSdk } from "@rarible/flow-sdk"
import { createApisSdk } from "../../common/apis"
import { retry } from "../../common/retry"
import { createTestFlowAuth } from "./test/create-test-flow-auth"
import { createTestItem } from "./test/create-test-item"
import { FlowMint } from "./mint"
import { sellItem } from "./test/sell-item"
import { FlowSell } from "./sell"
import { FlowBuy } from "./buy"

describe("Flow buy", () => {
	const { authUser1 } = createTestFlowAuth(fcl)
	const wallet = new FlowWallet(fcl)
	const sdk = createFlowSdk(wallet.fcl, "dev", {}, authUser1)
	const apis = createApisSdk("dev")
	const mint = new FlowMint(sdk, apis, "testnet")
	const sell = new FlowSell(sdk, apis)
	const fill = new FlowBuy(sdk, apis, "testnet")

	test.skip("Should buy flow NFT item", async () => {
		const itemId = await createTestItem(mint)
		const orderId = await sellItem(sell, itemId, "0.1")
		const order = await retry(10, 4000, () => apis.order.getOrderById({ id: orderId }))
		expect(order.take.value.toString()).toEqual("0.1")

		const prepareBuy = await fill.buy({ order })
		const tx = await prepareBuy.submit({ amount: 1 })
		expect(tx.transaction.status).toEqual(4)
	})
})
