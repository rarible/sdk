import type { Binary, ConfigurationParameters } from "@rarible/ethereum-api-client"
import type { Word } from "@rarible/types"
import type { Address } from "@rarible/types"

export type EthereumNetwork =
  | "mainnet"
  | "testnet"
  | "staging"
  | "mumbai"
  | "polygon"
  | "dev-ethereum"
  | "dev-polygon"
  | "staging-polygon"
  | "mantle"
  | "testnet-mantle"

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
	marketplaceMarker?: Binary
	apiKey?: string
}

export interface EthereumNetworkConfig {
	openseaOrdersMetadata?: Word
}

export type EIP712Domain = {
	name: string;
	version: string;
	chainId: number;
	verifyingContract: Address;
}
