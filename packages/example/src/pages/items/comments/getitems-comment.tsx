import React from "react"
import { Code } from "../../../components/common/code"

export function GetItemsComment() {
	return <>
		<Code>
			{`
// get items by owner		
const items = await sdk.apis.item.getItemsByOwner({
	owner: "ETHEREUM:...", // wallet address in union format 
})
// Items: {
//   total: number;
//   continuation?: string;
//   items: Array<Item>;
// }[]
		`}
		</Code>
	</>
}
