import type { EthereumNetwork } from "../types"
import { mainnetConfig } from "./mainnet"
import type { EthereumConfig } from "./type"
import { mumbaiConfig } from "./mumbai"
import { polygonConfig } from "./polygon"
import { devEthereumConfig } from "./dev"
import { devPolygonConfig } from "./polygon-dev"
import { testnetEthereumConfig } from "./testnet"
import { mantleTestnetConfig } from "./testnet-mantle"
import { mantleConfig } from "./mantle"
import { arbitrumTestnetConfig } from "./testnet-arbitrum"
import { arbitrumConfig } from "./arbitrum"
import { zkSyncTestnetConfig } from "./testnet-zksync"
import { zkSyncConfig } from "./zksync"
import { chilizConfig } from "./chilliz"
import { chilizTestnetConfig } from "./testnet-chiliz"
import { lightlinkConfig } from "./lightlink"
import { testnetLightlinkConfig } from "./testnet-lightlink"
import { rariTestnetConfig } from "./testnet-rari"
import { rariMainnetConfig } from "./rari"
import { zkatanaConfig } from "./zkatana"
import { baseConfig } from "./base"
import { baseSepoliaConfig } from "./base-sepolia"
import { xaiConfig } from "./xai"
import { fiefTestnetConfig } from "./testnet-fief"
import { xaiTestnetConfig } from "./testnet-xai"
import { kromaTestnetConfig } from "./testnet-kroma"
import { celoTestnetConfig } from "./testnet-celo"
import { celoConfig } from "./celo"
import { astarConfig } from "./astar"
import { kromaConfig } from "./kroma"

export const configDictionary: Record<EthereumNetwork, EthereumConfig> = {
	mainnet: mainnetConfig,
	mumbai: mumbaiConfig,
	polygon: polygonConfig,
	"dev-ethereum": devEthereumConfig,
	"dev-polygon": devPolygonConfig,
	mantle: mantleConfig,
	"testnet-mantle": mantleTestnetConfig,
	testnet: testnetEthereumConfig,
	"testnet-arbitrum": arbitrumTestnetConfig,
	arbitrum: arbitrumConfig,
	"testnet-zksync": zkSyncTestnetConfig,
	zksync: zkSyncConfig,
	chiliz: chilizConfig,
	"testnet-chiliz": chilizTestnetConfig,
	lightlink: lightlinkConfig,
	"testnet-lightlink": testnetLightlinkConfig,
	"testnet-rari": rariTestnetConfig,
	rari: rariMainnetConfig,
	zkatana: zkatanaConfig,
	astar: astarConfig,
	base: baseConfig,
	"base-sepolia": baseSepoliaConfig,
	"testnet-xai": xaiTestnetConfig,
	xai: xaiConfig,
	"testnet-fief": fiefTestnetConfig,
	"testnet-kroma": kromaTestnetConfig,
	kroma: kromaConfig,
	"testnet-celo": celoTestnetConfig,
	"celo": celoConfig,
}

export function getEthereumConfig(env: EthereumNetwork): EthereumConfig {
	return configDictionary[env]
}

export type GetConfigByChainId = () => Promise<EthereumConfig>

export function getNetworkConfigByChainId(chainId: number): EthereumConfig {
	const config = Object.values(configDictionary).find((x: EthereumConfig) => x.chainId === chainId)
	if (!config) throw new Error(`ChainID ${chainId} is not found in list of supported chains`)
	return config
}
