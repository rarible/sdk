import { toBigNumber, toCurrencyId } from "@rarible/types"
import type { ItemId } from "@rarible/api-client"
import { FLOW_TESTNET_ACCOUNT_2 } from "@rarible/flow-test-common"
import type { FlowBid } from "../bid"
import { convertFlowUnionAddress } from "../common/converters"
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
		originFees: [{ account: convertFlowUnionAddress(FLOW_TESTNET_ACCOUNT_2.address), value: 200 }],
	})
	expect(bidId).toBeTruthy()
	return bidId
}

export async function createTestBidWithCurrencyId(bid: FlowBid, itemId: ItemId) {
	const { submit } = await bid.bid({ itemId })
	const bidId = await submit({
		amount: 1,
		price: toBigNumber("0.1"),
		currency: toCurrencyId(testFlowToken),
		originFees: [{ account: convertFlowUnionAddress(FLOW_TESTNET_ACCOUNT_2.address), value: 200 }],
	})
	expect(bidId).toBeTruthy()
	return bidId
}
