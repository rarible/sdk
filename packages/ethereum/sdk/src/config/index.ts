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
}

export function getEthereumConfig(env: EthereumNetwork): EthereumConfig {
	return configDictionary[env]
}
