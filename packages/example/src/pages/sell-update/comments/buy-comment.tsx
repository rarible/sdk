import { Code } from "../../../components/common/code"

export function BuyComment() {
  return (
    <>
      <Code>
        {`
// get order info
const buy = await sdk.order.buy({
  orderId: <ORDER ID>
})
// buy: {
//   baseFee: number
//   maxAmount: BigNumber
//   multiple: boolean
//   submit: Function
//   supportsPartialFill: boolean
// }  

// send transaction
const result = await buy.submit({
  amount: 1,
})
// result: IBlockchainTransaction
		`}
      </Code>
    </>
  )
}
