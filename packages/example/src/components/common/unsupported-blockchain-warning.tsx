import React from "react"
import { BlockchainGroup } from "@rarible/api-client"
import { Alert, AlertTitle } from "@mui/material"

interface IUnsupportedBlockchainWarningProps {
	blockchain: BlockchainGroup | undefined
	message?: string
}

export function UnsupportedBlockchainWarning({ blockchain, message }: IUnsupportedBlockchainWarningProps) {
	return <Alert severity="warning">
		<AlertTitle>
			{
				blockchain ?
					<>Unsupported blockchain: {blockchain}</> :
					<>Wallet is not connected</>
			}
		</AlertTitle>
		{message ?? "Page functionality is limited"}
	</Alert>
}