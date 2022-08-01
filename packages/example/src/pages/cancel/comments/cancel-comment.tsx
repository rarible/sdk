import React from "react"
import { Code } from "../../../components/common/code"

export function CancelComment() {
	return <>
		<Code>
			{`
// get order info
const result = await sdk.order.cancel({
  orderId: <ORDER ID>
})
// result: IBlockchainTransaction
		`}
		</Code>
	</>
}
