import React from "react"
import { Code } from "../../../components/common/code"

export function MintComment() {
	return <>
		<Code>
			{`
// get collection by id			
const collection = await sdk.apis.collection.getCollectionById({
  collection: <COLLECTION ID>
})

// get mint info
const mint = await sdk.nft.mint({ collection })
// mint: {
//   multiple: boolean, 
//   supportsRoyalties: boolean, 
//   supportsLazyMint: boolean, 
//   submit: Function
// }

// send transaction
const result = await mint.submit({
  uri: "TOKEN URI",
  supply: 1,
  lazyMint: false
})
// result: {
//   type: "on-chain", 
//   itemId: string, 
//   transaction: IBlockchainTransaction
// } | {
//   type: "off-chain", 
//   itemId: string
// }
		`}
		</Code>
	</>
}
