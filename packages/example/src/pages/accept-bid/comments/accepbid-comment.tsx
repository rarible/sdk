import React from "react"
import { Code } from "../../../components/common/code"

export function AcceptBidComment() {
	return <>
		<Code>
			{`
// get order info
const accept = await connection.sdk.order.acceptBid({
  orderId: <ORDER ID>
})

// send transaction
const result = await accept.submit({
  amount: 1,
})
// result: IBlockchainTransaction
		`}
		</Code>
	</>
}
