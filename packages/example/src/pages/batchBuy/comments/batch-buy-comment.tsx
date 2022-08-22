import React from "react"
import { Code } from "../../../components/common/code"

export function BatchBuyComment() {
	return <>
		<Code>
			{`
// get orders info
const batchBuy = await connection.sdk.order.batchBuy([
  {orderId: <ORDER ID 1>},
  {orderId: <ORDER ID 2>}
])

// batchBuy: {
//   submit: Function,
//   prepared: [{
//     orderId: OrderId		
//     baseFee: number
//     maxAmount: BigNumber
//     multiple: boolean
//     supportsPartialFill: boolean
//   }, {
//     orderId: OrderId
//     baseFee: number
//     maxAmount: BigNumber
//     multiple: boolean
//     supportsPartialFill: boolean
//   }]
// }  

// send transaction
const result = await buy.submit([{
  	orderId: <ORDER ID 1>,
  	amount: 1,
  }, {
  	orderId: <ORDER ID 2>
  	amount: 1,
  	originFees: [],
}])
// result: IBlockchainTransaction
		`}
		</Code>
	</>
}
