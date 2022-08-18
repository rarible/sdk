import React from "react"
import { Code } from "../../../components/common/code"

export function TransferComment() {
	return <>
		<Code>
			{`
// get item info
const prepare = await sdk.nft.transfer({
  itemId: <ITEM ID>
})
// prepare: {
//   multiple: boolean,
//   maxAmount: BigNumber
//   submit: Function
// }  

// send transaction
const result = await prepare.submit({
  amount: 1,
  to: UnionAddress
})
// result: IBlockchainTransaction
		`}
		</Code>
	</>
}
