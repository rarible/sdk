import React from "react"
import { Typography } from "@mui/material"
import { Code } from "../../../components/common/code"
import { InlineCode } from "../../../components/common/inline-code"

export function CollectionDeployComment() {
	return <>
		<Typography gutterBottom>
			You can deploy new collection with <InlineCode>sdk.nft.deploy()</InlineCode> method
		</Typography>
		<Code>
			{`
sdk.nft.deploy({
  blockchain: Blockchain.ETHEREUM,
  asset: {
    assetType: "ERC721",
    arguments: {
      name: "My Collection",
      symbol: "MYCOL",
      baseURI: "https://example.com",
      contractURI: "https://example.com",
      isUserToken: false
    }
  }
})
		`}
		</Code>
	</>
}
