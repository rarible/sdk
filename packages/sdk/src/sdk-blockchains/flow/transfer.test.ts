import * as fcl from "@onflow/fcl"
import { FlowWallet } from "@rarible/sdk-wallet"
import { createFlowSdk } from "@rarible/flow-sdk"
import { FLOW_TESTNET_ACCOUNT_1 } from "@rarible/flow-test-common"
import { createApisSdk } from "../../common/apis"
import { retry } from "../../common/retry"
import { createTestFlowAuth } from "./test/create-test-flow-auth"
import { createTestItem } from "./test/create-test-item"
import { FlowMint } from "./mint"
import { FlowTransfer } from "./transfer"
import { convertFlowUnionAddress } from "./common/converters"

describe("Flow transfer", () => {
	const { authUser1 } = createTestFlowAuth(fcl)
	const wallet = new FlowWallet(fcl)
	const sdk = createFlowSdk(wallet.fcl, "dev", {}, authUser1)
	const apis = createApisSdk("dev")
	const mint = new FlowMint(sdk, apis, "testnet")
	const transfer = new FlowTransfer(sdk, "testnet")

	test.skip("Should transfer flow NFT item", async () => {
		const itemId = await createTestItem(mint)
		await retry(10, 4000, () => apis.item.getItemById({ itemId }))
		const prepare = await transfer.transfer({ itemId })
		const to = convertFlowUnionAddress(FLOW_TESTNET_ACCOUNT_1.address)
		const tx = await prepare.submit({ to })
		expect(tx.transaction.status).toEqual(4)
	})
})
