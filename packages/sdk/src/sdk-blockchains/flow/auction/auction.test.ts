import * as fcl from "@onflow/fcl"
import { FlowWallet } from "@rarible/sdk-wallet"
import { createFlowSdk } from "@rarible/flow-sdk"
import { createTestFlowAuth } from "../test/create-test-flow-auth"
import { createApisSdk } from "../../../common/apis"
import { FlowMint } from "../mint"
import { createTestItem } from "../test/create-test-item"
import { createTestFlowAuction } from "../test/create-test-auction"
import { convertFlowUnionAddress } from "../common/converters"
import { FlowAuction } from "./"

describe("Flow auction", () => {
	const { authUser1 } = createTestFlowAuth(fcl)
	const wallet = new FlowWallet(fcl)
	const sdk = createFlowSdk(wallet.fcl, "dev", {}, authUser1)
	const apis = createApisSdk("dev")
	const mint = new FlowMint(sdk, apis, "testnet")
	const auctionService = new FlowAuction(sdk, "testnet")

	test.skip("Test flow auctions on testnet", async () => {
		const originFees = [{
			account: convertFlowUnionAddress(await sdk.wallet.getFrom()),
			value: 1000,
		}]
		const itemId = await createTestItem(mint)
		const auctionId = await createTestFlowAuction(auctionService, itemId)
		await auctionService.cancel({ auctionId })

		const auctionId2 = await createTestFlowAuction(auctionService, itemId)
		const bidTx = await auctionService.createBid({
			auctionId: auctionId2,
			price: "0.1",
			originFees,
		})
		expect(bidTx.transaction.status).toEqual(4)
		const bidTx2 = await auctionService.buyOut({
			auctionId: auctionId2,
			originFees,
		})
		expect(bidTx2.transaction.status).toEqual(4)
	})
})
