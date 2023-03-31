import React from "react"
import { Code } from "../../../components/common/code"

export function SignMessageComment() {
	return <>
		<Code>
			{`
// sign message		
const signResult = await sdk.wallet?.signPersonalMessage(input)

// signResult : {
//   signature: string
//   publicKey: string
// }
		`}
		</Code>
	</>
}
