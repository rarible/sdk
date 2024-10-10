import type { IRaribleSdk } from "@rarible/sdk/build/domain"
import { CircularProgress } from "@mui/material"
import type { UnionAddress } from "@rarible/types"
import type { BlockchainWallet } from "@rarible/sdk-wallet"
import { Blockchain } from "@rarible/api-client"
import type { ConnectionState } from "@rarible/connector"
import type { IWalletAndAddress } from "@rarible/connector-helper"
import { useEnvironmentContext } from "../../components/connector/env"
import { useSdkContext } from "../../components/connector/sdk"
import { ConvertForm, isAvailableWethConvert } from "./convert-form"
import { useGetBalance } from "./hooks/use-get-balance"
import { getCurrenciesForBlockchain } from "./utils/currencies"

interface INativeBalanceProps {
  sdk: IRaribleSdk
  wallet: BlockchainWallet
  walletAddress: UnionAddress
}

export function NativeBalance({ sdk, wallet, walletAddress }: INativeBalanceProps) {
  const { environment } = useEnvironmentContext()
  const connection = useSdkContext()
  const currencies = getCurrenciesForBlockchain(wallet.walletType, environment, connection)
  const balance = useGetBalance(sdk, walletAddress, currencies.find(c => c.isNative)!.getAssetType())

  function renderBalance() {
    if (balance.isLoading) return <CircularProgress size={14} />
    if (balance.error) return <span>{JSON.stringify(balance.error?.message, null, 2)}</span>
    return <span>{balance.data?.toString()}</span>
  }

  return (
    <div style={{ marginBottom: 20 }}>
      <div>Native Balance: {renderBalance()}</div>
      {!isMantle(connection.state) && isAvailableWethConvert(wallet.walletType, environment) && (
        <ConvertForm sdk={sdk} walletAddress={walletAddress} />
      )}
    </div>
  )
}

function isMantle(state: ConnectionState<IWalletAndAddress>) {
  return state.status === "connected" && state.connection.blockchain === Blockchain.MANTLE
}
