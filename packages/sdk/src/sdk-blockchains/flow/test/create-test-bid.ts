import { toBigNumber } from "@rarible/types"
import type { ItemId } from "@rarible/api-client"
import type { FlowBid } from "../bid"
import { testFlowToken } from "./common"

export async function createTestBid(bid: FlowBid, itemId: ItemId) {
	const { submit } = await bid.bid({ itemId })
	const bidId = await submit({
		amount: 1,
		price: toBigNumber("0.1"),
		currency: {
			"@type": "FLOW_FT",
			contract: testFlowToken,
		},
	})
	expect(bidId).toBeTruthy()
	return bidId
}
