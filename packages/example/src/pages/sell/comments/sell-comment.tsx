import React from "react"
import { Code } from "../../../components/common/code"

export function SellComment() {
	return <>
		<Code>
			{`
// get sell info
const sell = await connection.sdk.order.sell({
  itemId: <ITEM ID>
})
// sell: {
//   baseFee: number
//   maxAmount: BigNumber
//   multiple: boolean
//   submit: Function
//   supportedCurrencies: - supported currencies list 
// }

// send transaction
const result = await sell.submit({
  price: 2,
  currency: {"@type": "ETH"},
  amount: 1,
})
// result: string - order id
		`}
		</Code>
	</>
}
