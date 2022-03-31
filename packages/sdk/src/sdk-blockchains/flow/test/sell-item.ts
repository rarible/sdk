import type { ItemId, OrderId } from "@rarible/types"
import { toBigNumber, toCurrencyId } from "@rarible/types"
import { FLOW_TESTNET_ACCOUNT_2 } from "@rarible/flow-test-common"
import type { FlowSell } from "../sell"
import { convertFlowUnionAddress } from "../common/converters"
import { testFlowToken } from "./common"

export async function sellItem(sell: FlowSell, itemId: ItemId, priceDecimals: string): Promise<OrderId> {
	const { submit } = await sell.sell()
	const orderId = await submit({
		amount: 1,
		price: toBigNumber(priceDecimals),
		currency: {
			"@type": "FLOW_FT",
			contract: testFlowToken,
		},
		itemId,
		originFees: [{ account: convertFlowUnionAddress(FLOW_TESTNET_ACCOUNT_2.address), value: 200 }],
	})
	expect(orderId).toBeTruthy()
	return orderId
}

export async function sellItemWithCurrencyId(sell: FlowSell, itemId: ItemId, priceDecimals: string): Promise<OrderId> {
	const { submit } = await sell.sell()
	const orderId = await submit({
		amount: 1,
		price: toBigNumber(priceDecimals),
		currency: toCurrencyId(testFlowToken),
		itemId,
		originFees: [{ account: convertFlowUnionAddress(FLOW_TESTNET_ACCOUNT_2.address), value: 200 }],
	})
	expect(orderId).toBeTruthy()
	return orderId
}
