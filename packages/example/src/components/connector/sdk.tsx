import React, { useContext, useEffect, useMemo, useState } from "react"
import { createRaribleSdk, WalletType } from "@rarible/sdk"
import type { ConnectionState, IConnector } from "@rarible/connector"
import { getStateDisconnected } from "@rarible/connector"
import type { IWalletAndAddress } from "@rarible/connector-helper"
import type { UnionAddress } from "@rarible/types"
import { toUnionAddress } from "@rarible/types"
import { Blockchain } from "@rarible/api-client"
import type { RaribleSdkEnvironment } from "@rarible/sdk/build/config/domain"
import type { IRaribleSdk, IRaribleSdkConfig } from "@rarible/sdk/build/domain"
import { LogsLevel } from "@rarible/sdk/build/domain"
import { isEVMBlockchain } from "@rarible/sdk-common"
import { useEnvironmentContext } from "./env"
import { getConnector } from "./connectors-setup"
import { useApiKeyContext } from "./api-key"

export type SdkContextValue = {
  connector: IConnector<string, IWalletAndAddress>
  state: ConnectionState<IWalletAndAddress>
  sdk: IRaribleSdk
  walletAddress: UnionAddress | undefined
}

export const sdkContext = React.createContext<SdkContextValue | undefined>(undefined)

export function SdkContextProvider({ children }: React.PropsWithChildren<{}>) {
  const { environment } = useEnvironmentContext()
  const [state, setState] = useState<ConnectionState<IWalletAndAddress>>(() => getStateDisconnected())
  const connector = useMemo(() => getConnector(environment), [environment])
  const active = useMemo(() => extractActiveConnection(state), [state])
  const { prodApiKey, testnetApiKey } = useApiKeyContext()
  const currentApiKey = environment === "prod" ? prodApiKey : testnetApiKey

  useEffect(() => {
    const sub = connector.connection.subscribe(x => setState(x))
    return () => sub.unsubscribe()
  }, [connector])

  const sdk = useMemo(() => {
    return createRaribleSdk(active?.wallet, environment, {
      ...createRaribleConfig(environment),
      apiKey: currentApiKey,
    })
  }, [active, environment, currentApiKey])

  const walletAddress = useMemo(() => {
    if (active) return getWalletAddress(active.address, active.blockchain)
    return undefined
  }, [active])

  return (
    <sdkContext.Provider
      value={{
        connector,
        state,
        sdk,
        walletAddress,
      }}
      children={children}
    />
  )
}

export function useSdkContext() {
  const ctx = useContext(sdkContext)
  if (!ctx) throw new Error("No sdk context provider is rendered")
  return ctx
}

function extractActiveConnection(state: ConnectionState<IWalletAndAddress> | undefined) {
  if (state?.status === "connected") return state.connection
  return undefined
}

function createRaribleConfig(environment: RaribleSdkEnvironment): IRaribleSdkConfig {
  return {
    logs: LogsLevel.TRACE,
    blockchain: {
      [WalletType.ETHEREUM]: {
        marketplaceMarker: "0x12345678900000000000000000000000000123456789face",
      },
      [WalletType.SOLANA]: {
        eclipseMarketplaces: ["Rarim7DMoD45z1o25QWPsWvTdFSSEdxaxriwWZLLTic"],
      },
    },
  }
}

function getWalletAddress(address: string, blockchain: Blockchain): UnionAddress {
  // @todo make it more generic?
  // rarible/types v10
  if (isEVMBlockchain(blockchain) || blockchain === Blockchain.IMMUTABLEX) {
    return toUnionAddress("ETHEREUM:" + address)
  }

  if (blockchain === Blockchain.ECLIPSE) {
    return toUnionAddress("SOLANA:" + address)
  }

  return toUnionAddress(blockchain + ":" + address)
}
