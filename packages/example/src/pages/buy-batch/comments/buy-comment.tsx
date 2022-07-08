import React from "react"
import { Code } from "../../../components/common/code"

export function BuyBatchComment() {
	return <>
		<Code>
			{`
// get order info
const buy = await connection.sdk.order.buyBatch([{orderId: <ORDER ID>}])
// buy: {
//   preparedFillResponse: [
//   baseFee: number
//   maxAmount: BigNumber
//   multiple: boolean
//   supportsPartialFill: boolean
//]
//   submit: Function
//   }
// }  

// send transaction
const result = await buy.submit({
  amount: 1,
})
// result: IBlockchainTransaction
		`}
		</Code>
	</>
}
