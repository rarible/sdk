import React from "react"
import { Code } from "../../components/common/code"
import { Typography } from "@mui/material"
import { UploadMetaResponse } from "@rarible/sdk/src/sdk-blockchains/union/meta/domain"

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
