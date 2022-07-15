import * as fcl from "@onflow/fcl"
import { FlowWallet } from "@rarible/sdk-wallet"
import { createFlowSdk } from "@rarible/flow-sdk"
import { createApisSdk } from "../../common/apis"
import { retry } from "../../common/retry"
import { createTestFlowAuth } from "./test/create-test-flow-auth"
import { createTestItem } from "./test/create-test-item"
import { FlowMint } from "./mint"
import { FlowBurn } from "./burn"

describe("Flow burn", () => {
	const { authUser1 } = createTestFlowAuth(fcl)
	const wallet = new FlowWallet(fcl)
	const sdk = createFlowSdk(wallet.fcl, "testnet", {}, authUser1)
	const apis = createApisSdk("testnet")
	const mint = new FlowMint(sdk, apis, "testnet")
	const burn = new FlowBurn(sdk, "testnet")

	test.skip("Should burn NFT", async () => {
		const itemId = await createTestItem(mint)
		const nft = await retry(10, 4000, () => apis.item.getItemById({ itemId }))
		expect(nft.id).toEqual(itemId)
		const prepare = await burn.burn({ itemId })
		const tx = await prepare.submit()
		if (tx) {
			expect(tx.transaction.status).toEqual(4)
		}
	})
})
