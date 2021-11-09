import type { ItemId, OrderId } from "@rarible/types"
import { toBigNumber } from "@rarible/types"
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
	})
	expect(orderId).toBeTruthy()
	return orderId
}