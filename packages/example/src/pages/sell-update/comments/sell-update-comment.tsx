import React from "react"
import { Code } from "../../../components/common/code"

export function SellUpdateComment() {
	return <>
		<Code>
			{`
// get order info
const sellUpdateResponse = await sdk.order.sellUpdate.prepare({
  orderId: <ORDER ID>
})
// buy: {
//   originFeeSupport: OriginFeeSupport.NONE | OriginFeeSupport.AMOUNT_ONLY | OriginFeeSupport.FULL
//   payoutsSupport: 
//   maxFeesBasePointSupport: BigNumber
//   supportedCurrencies: Array
//   baseFee: number
//   submit: Function
// }  

// send transaction
const result = await sellUpdateResponse.submit({
  price: "0.1",
})
// result: IBlockchainTransaction
		`}
		</Code>
	</>
}
