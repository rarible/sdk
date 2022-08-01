import React from "react"
import { Code } from "../../../components/common/code"

export function UploadMetaComment() {
	return <>
		<Code>
			{`
// upload metadata
const uploadMeta = await sdk.nft.uploadMeta(
	YOUR_NFT_STORAGE_API_KEY: string, 
	accountAddress: string,
	properties: {
		name: string
		description?: string
		image?: File
		animationUrl?: File
		attributes: {key: string, value: string}[]
	},
	royalty: string
)

// uploadMeta: {
// 	originalFile: File
// 	URL: string
// 	IPFSURL: string
// }  
			`}
		</Code>
	</>
}
