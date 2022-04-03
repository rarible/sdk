import React from "react"
import { Code } from "../../../components/common/code"

export function BidComment() {
	return <>
		<Code>
			{`
// get sell info
const bid = await connection.sdk.order.bid({
  itemId: <ITEM ID>
})

// send transaction
const result = await bid.submit({
  price: 2,
  currency: {
  	"@type": "ERC20",
  	contract: "ETHEREUM:0xc778417E063141139Fce010982780140Aa0cD5Ab" // WETH contract address
  },
  amount: 1,
})
// result: string - order id
		`}
		</Code>
	</>
}
