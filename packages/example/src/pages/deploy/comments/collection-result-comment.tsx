import React from "react"
import { Typography } from "@mui/material"
import { InlineCode } from "../../../components/common/inline-code"

export function CollectionResultComment() {
	return <>
		<Typography gutterBottom>
			Collection Address can be used in <InlineCode>sdk.nft.mint()</InlineCode> method
		</Typography>
	</>
}
