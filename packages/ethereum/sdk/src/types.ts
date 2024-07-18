import type { Binary, ConfigurationParameters } from "@rarible/ethereum-api-client"
import type { Word } from "@rarible/types"

export const ethereumSdkEnvironments = ["testnet", "production", "dev"] as const
export type EthereumSdkEnvironment = (typeof ethereumSdkEnvironments)[number]

export const ethereumNetworks = [
  "mainnet",
  "testnet",
  "mumbai",
  "polygon",
  "dev-ethereum",
  "dev-polygon",
  "amoy-polygon",
  "mantle",
  "testnet-mantle",
  "arbitrum",
  "testnet-arbitrum",
  "zksync",
  "testnet-zksync",
  "chiliz",
  "testnet-chiliz",
  "lightlink",
  "testnet-lightlink",
  "testnet-rari",
  "rari",
  "zkatana",
  "astar-zkevm",
  "astar-kyoto",
  "base",
  "base-sepolia",
  "testnet-celo",
  "celo",
  "testnet-fief",
  "testnet-xai",
  "xai",
  "testnet-kroma",
  "kroma",
  "sei-arctic-1",
  "sei-pacific-1",
  "moonbeam-testnet",
  "moonbeam",
  "palm-testnet",
  "palm",
  "etherlink-testnet",
  "etherlink",
  "lisk-sepolia",
  "lisk",
]

export type EthereumNetwork = (typeof ethereumNetworks)[number]

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
