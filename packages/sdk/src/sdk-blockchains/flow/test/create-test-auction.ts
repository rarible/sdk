import { toBn } from "@rarible/utils/build/bn"
import type { AuctionId, ItemId } from "@rarible/api-client"
import type { FlowAuction } from "../auction"
import { testFlowCollection, testFlowToken } from "./common"

export async function createTestFlowAuction(auctionService: FlowAuction, itemId: ItemId): Promise<AuctionId> {
	const { submit } = await auctionService.start({
		collectionId: testFlowCollection,
	})
	const { auctionId } = await submit({
		amount: 1,
		currency: {
			"@type": "FLOW_FT",
			contract: testFlowToken,
		},
		itemId,
		minimalStep: toBn("0.1"),
		minimalPrice: toBn("0.1"),
		duration: 1000,
		buyOutPrice: "10",
		originFees: [],
	})
	expect(parseInt(auctionId.split(":")[1])).toBeGreaterThanOrEqual(0)
	return auctionId
}
