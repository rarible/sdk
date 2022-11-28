import type { Binary, ConfigurationParameters } from "@rarible/ethereum-api-client"
import type { Word } from "@rarible/types"

export type EthereumNetwork =
  | "mainnet"
  | "testnet"
  | "staging"
  | "mumbai"
  | "polygon"
  | "dev-ethereum"
  | "dev-polygon"
  | "staging-polygon"

export enum LogsLevel {
	DISABLED = 0,
	ERROR = 1,
	TRACE = 2
}

export interface LogsConfig {
	level: LogsLevel,
	session?: string,
}

export interface IRaribleEthereumSdkConfig {
	apiClientParams?: ConfigurationParameters
	logs?: LogsConfig
	ethereum?: EthereumNetworkConfig
	polygon?: EthereumNetworkConfig
	marketplaceMarker?: Binary
	apiKey?: string
}

export interface EthereumNetworkConfig {
	openseaOrdersMetadata?: Word
}
