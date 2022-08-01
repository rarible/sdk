import React from "react"
import { Code } from "../../../components/common/code"

export function GetBalanceComment() {
	return <>
		<Code>
			{`
// get items by owner		
const balance = await sdk.balances.getBalance(
	"ETHEREUM:...", // wallet address 
	{ "@type": "ETH", blockchain: "ETHEREUM" } // currency type
)
		`}
		</Code>
	</>
}
