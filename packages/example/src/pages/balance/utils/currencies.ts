import type { UnionContractAddress } from "@rarible/api-client"
import { Blockchain } from "@rarible/api-client"
import type { RequestCurrencyAssetType } from "@rarible/sdk/build/common/domain"
import { WalletType } from "@rarible/sdk-wallet"
import { toUnionContractAddress } from "@rarible/types"
import type { RaribleSdkEnvironment } from "@rarible/sdk/build/config/domain"
import type { SdkContextValue } from "../../../components/connector/sdk"

interface ISupportedCurrency {
  isNative: boolean
  requireContract: boolean
  getAssetType(contract?: string): RequestCurrencyAssetType
}

export function getCurrenciesForBlockchain(
  blockchain: WalletType,
  env?: RaribleSdkEnvironment,
  conn?: SdkContextValue,
): ISupportedCurrency[] {
  switch (blockchain) {
    case WalletType.ETHEREUM:
      return [
        {
          isNative: true,
          requireContract: false,
          getAssetType: () => ({
            "@type": "ETH",
            blockchain: conn?.state?.status === "connected" ? conn.state.connection.blockchain : Blockchain.ETHEREUM,
          }),
        },
      ]
    case WalletType.IMMUTABLEX:
      return [
        {
          isNative: true,
          requireContract: false,
          getAssetType: () => ({
            "@type": "ETH",
            blockchain: Blockchain.IMMUTABLEX,
          }),
        },
      ]
    case WalletType.SOLANA:
      return [
        {
          isNative: true,
          requireContract: false,
          getAssetType: () => {
            const blockchain =
              conn?.state?.status === "connected" ? conn.state.connection.blockchain : Blockchain.SOLANA

            if (blockchain === Blockchain.SOLANA) {
              return {
                "@type": "SOLANA_SOL",
              }
            } else {
              return {
                "@type": "CURRENCY_NATIVE",
                blockchain: blockchain,
              }
            }
          },
        },
      ]
    case WalletType.FLOW:
      return [
        {
          isNative: true,
          requireContract: false,
          getAssetType: () => ({
            "@type": "FLOW_FT",
            contract: getFlowTokenAddressByEnv(env),
          }),
        },
      ]
    case WalletType.APTOS:
      return [
        {
          isNative: true,
          requireContract: false,
          getAssetType: () => ({
            "@type": "CURRENCY_NATIVE",
            blockchain: Blockchain.APTOS,
          }),
        },
      ]
    default:
      throw new Error("Unsupported blockchain")
  }
}

export function getFlowTokenAddressByEnv(env?: RaribleSdkEnvironment): UnionContractAddress {
  switch (env) {
    case "testnet":
      return toUnionContractAddress("FLOW:A.7e60df042a9c0868.FlowToken")
    case "prod":
      return toUnionContractAddress("FLOW:A.1654653399040a61.FlowToken")
    default:
      throw new Error(`Can't find FlowToken address on env=${env}`)
  }
}
