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

export const configDictionary: {
	[K in EthereumNetwork]: EthereumConfig<K>
} = {
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
	base: baseConfig,
	"base-sepolia": baseSepoliaConfig,
}

export function getEthereumConfig<T extends EthereumNetwork>(network: T): EthereumConfig<T> {
	return configDictionary[network]
}

const dictionaryFlat = Object.values(configDictionary)

export function getNetworkConfigByChainId(chainId: number): EthereumConfig {
	const config = dictionaryFlat.find(x => x.chainId === chainId)
	if (!config) throw new UnsupportedNetworkError(chainId)
	return config
}

class UnsupportedNetworkError extends Error {
	constructor(chainId: number) {
		super(`ChainID ${chainId} is not found in list of supported chains`)
		this.name = "UnsupportedNetworkError"
	}
}