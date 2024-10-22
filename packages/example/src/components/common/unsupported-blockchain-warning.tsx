import { Alert, AlertTitle } from "@mui/material"
import type { WalletType } from "@rarible/sdk-wallet"

interface IUnsupportedBlockchainWarningProps {
  blockchain: WalletType | undefined
  message?: string
}

export function UnsupportedBlockchainWarning({
  blockchain,
  message = "Blockchain is not supported",
}: IUnsupportedBlockchainWarningProps) {
  return (
    <Alert severity="warning">
      <AlertTitle>{blockchain ? `Unsupported blockchain: ${blockchain}` : "Wallet is not connected"}</AlertTitle>
      <span>{message}</span>
    </Alert>
  )
}
