import type { Binary, ConfigurationParameters } from "@rarible/ethereum-api-client"
import type { Word } from "@rarible/types"

export type EthereumNetwork =
  | "mainnet"
  | "testnet"
  | "mumbai"
  | "polygon"
  | "dev-ethereum"
  | "dev-polygon"
  | "mantle"
  | "testnet-mantle"
  | "arbitrum"
  | "testnet-arbitrum"
  | "zksync"
  | "testnet-zksync"
  | "chiliz"
  | "testnet-chiliz"
  | "lightlink"
  | "testnet-lightlink"
  | "testnet-rari"
  | "rari"
  | "zkatana"
  | "astar-zkevm"
  | "base"
  | "base-sepolia"

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
