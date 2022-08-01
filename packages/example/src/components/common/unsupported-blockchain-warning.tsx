import React from "react"
import { Alert, AlertTitle } from "@mui/material"
import { WalletType } from "@rarible/sdk-wallet"

interface IUnsupportedBlockchainWarningProps {
	blockchain: WalletType | undefined
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