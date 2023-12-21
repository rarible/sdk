import React from "react"
import { Typography } from "@mui/material"
import type { UploadMetaResponse } from "@rarible/sdk"
import { Code } from "../../components/common/code"

interface IUploadResultProps {
	result: UploadMetaResponse
}

export function UploadMetaResult({ result }: IUploadResultProps) {
	return <>
		<Typography variant="overline">Upload result:</Typography>
		<Code theme={"light"} language="json" wrap>
			{
				JSON.stringify({
					url: result.URL,
					ipfsUrl: result.IPFSURL,
				}, null, " ")
			}
		</Code>
	</>
}
