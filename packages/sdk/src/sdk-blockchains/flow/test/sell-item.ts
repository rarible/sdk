import type { ItemId, OrderId } from "@rarible/types"
import { toBigNumber, toUnionAddress } from "@rarible/types"
import { FLOW_TESTNET_ACCOUNT_2 } from "@rarible/flow-test-common"
import type { FlowSell } from "../sell"
import { testFlowCollection, testFlowToken } from "./common"

export async function sellItem(sell: FlowSell, itemId: ItemId, priceDecimals: string): Promise<OrderId> {
	const { submit } = await sell.sell({
		collectionId: testFlowCollection,
	})
	const orderId = await submit({
		amount: 1,
		price: toBigNumber(priceDecimals),
		currency: {
			"@type": "FLOW_FT",
			contract: testFlowToken,
		},
		itemId,
		originFees: [{ account: toUnionAddress(`FLOW:${FLOW_TESTNET_ACCOUNT_2.address}`), value: 200 }],
	})
	expect(orderId).toBeTruthy()
	return orderId
}
