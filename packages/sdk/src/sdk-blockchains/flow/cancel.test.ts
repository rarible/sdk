import * as fcl from "@onflow/fcl"
import { FlowWallet } from "@rarible/sdk-wallet"
import { createFlowSdk } from "@rarible/flow-sdk"
import { createApisSdk } from "../../common/apis"
import { retry } from "../../common/retry"
import { createTestFlowAuth } from "./test/create-test-flow-auth"
import { FlowCancel } from "./cancel"
import { createTestItem } from "./test/create-test-item"
import { FlowMint } from "./mint"
import { sellItem } from "./test/sell-item"
import { FlowSell } from "./sell"

describe("Flow cancel", () => {
	const { authUser1 } = createTestFlowAuth(fcl)
	const wallet = new FlowWallet(fcl)
	const sdk = createFlowSdk(wallet.fcl, "testnet", {}, authUser1)
	const apis = createApisSdk("testnet")
	const cancel = new FlowCancel(sdk, apis, "testnet")
	const mint = new FlowMint(sdk, apis, "testnet")
	const sell = new FlowSell(sdk, apis)

	test.skip("Should cancel flow NFT order", async () => {
		const itemId = await createTestItem(mint)
		await retry(10, 4000, () => apis.item.getItemById({ itemId }))
		const orderId = await sellItem(sell, itemId, "0.1")
		await retry(10, 4000, () => apis.order.getOrderById({ id: orderId }))
		const tx = await cancel.cancel({ orderId })
		expect(tx).toBeTruthy()
	})
})
