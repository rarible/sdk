import type { Binary, ConfigurationParameters } from "@rarible/ethereum-api-client"
import type { Word } from "@rarible/types"
import type { configDictionary } from "./config"

export const ethereumSdkEnvironments = ["testnet", "production", "dev"] as const
export type EthereumSdkEnvironment = (typeof ethereumSdkEnvironments)[number]

export type EthereumNetwork = keyof typeof configDictionary

export enum LogsLevel {
  DISABLED = 0,
  ERROR = 1,
  TRACE = 2,
}

export interface LogsConfig {
  level: LogsLevel
  session?: string
}

export interface IRaribleEthereumSdkConfig {
  apiClientParams?: ConfigurationParameters
  logs?: LogsConfig
  ethereum?: EthereumNetworkConfig
  polygon?: EthereumNetworkConfig
  mantle?: EthereumNetworkConfig
  arbitrum?: EthereumNetworkConfig
  zksync?: EthereumNetworkConfig
  chiliz?: EthereumNetworkConfig
  rari?: EthereumNetworkConfig
  marketplaceMarker?: Binary
  apiKey?: string
}

export interface EthereumNetworkConfig {
  openseaOrdersMetadata?: Word
}

export interface EIP712Domain {
  name: string
  version: string
  chainId: number
  verifyingContract: string
}
