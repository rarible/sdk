import type { EthereumNetwork } from "../types"
import { liskMainnetConfig } from "./lisk"
import { liskSepoliaConfig } from "./lisk-sepolia"
import { mainnetConfig } from "./mainnet"
import { palmMainnetConfig } from "./palm"
import { palmTestnetConfig } from "./palm-testnet"
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
import { baseConfig } from "./base"
import { baseSepoliaConfig } from "./base-sepolia"
import { fiefTestnetConfig } from "./testnet-fief"
import { kromaTestnetConfig } from "./testnet-kroma"
import { kromaConfig } from "./kroma"
import { celoTestnetConfig } from "./testnet-celo"
import { celoConfig } from "./celo"
import { polygonAmoyConfig } from "./polygon-amoy"
import { seiArctic1Config } from "./sei-arctic-1"
import { seiPacific1Config } from "./sei-pacific-1"
import { moonbeamTestnetConfig } from "./moonbeam-testnet"
import { moonbeamMainnetConfig } from "./moonbeam"
import { etherlinkTestnetConfig } from "./etherlink-testnet"
import { etherlinkConfig } from "./etherlink"
import { testnetSaakuruConfig } from "./testnet-saakuru"
import { saakuruConfig } from "./saakuru"
import { testnetOasysConfig } from "./testnet-oasys"
import { oasysConfig } from "./oasys"
import { alephzeroMainnetConfig } from "./alephzero"
import { alephzeroTestnetConfig } from "./alephzero-testnet"
import { matchConfig } from "./match"
import { matchTestnetConfig } from "./match-testnet"
import { shapeMainnetConfig } from "./shape"
import { shapeTestnetConfig } from "./shape-testnet"
import { berachainTestnetConfig } from "./berachain-testnet"
import { telosTestnetConfig } from "./telos-testnet"
import { telosConfig } from "./telos"
import { abstractTestnetConfig } from "./testnet-abstract"
import { berachainConfig } from "./berachain"
import { abstractConfig } from "./abstract"
import { victionMainnetConfig } from "./viction"
import { victionTestnetConfig } from "./viction-testnet"
import { hederaMainnetConfig } from "./hedera"
import { hederaTestnetConfig } from "./hedera-testnet"
import { goatMainnetConfig } from "./goat"
import { goatTestnetConfig } from "./goat-testnet"
import { settlusConfig } from "./settlus"
import { settlusTestnetConfig } from "./settlus-testnet"
import { zkCandyConfig } from "./zkcandy"
import { zkCandyTestnetConfig } from "./zkcandy-testnet"

export const configDictionary: Record<string, EthereumConfig> = {
  mainnet: mainnetConfig,
  mumbai: mumbaiConfig,
  polygon: polygonConfig,
  "amoy-polygon": polygonAmoyConfig,
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
  base: baseConfig,
  "base-sepolia": baseSepoliaConfig,
  "testnet-celo": celoTestnetConfig,
  celo: celoConfig,
  "testnet-fief": fiefTestnetConfig,
  "testnet-kroma": kromaTestnetConfig,
  kroma: kromaConfig,
  "testnet-saakuru": testnetSaakuruConfig,
  saakuru: saakuruConfig,
  "testnet-oasys": testnetOasysConfig,
  oasys: oasysConfig,
  "sei-arctic-1": seiArctic1Config,
  "sei-pacific-1": seiPacific1Config,
  "moonbeam-testnet": moonbeamTestnetConfig,
  moonbeam: moonbeamMainnetConfig,
  "palm-testnet": palmTestnetConfig,
  palm: palmMainnetConfig,
  "etherlink-testnet": etherlinkTestnetConfig,
  etherlink: etherlinkConfig,
  "lisk-sepolia": liskSepoliaConfig,
  lisk: liskMainnetConfig,
  alephzero: alephzeroMainnetConfig,
  "alephzero-testnet": alephzeroTestnetConfig,
  match: matchConfig,
  "match-testnet": matchTestnetConfig,
  shape: shapeMainnetConfig,
  "shape-testnet": shapeTestnetConfig,
  berachain: berachainConfig,
  "berachain-testnet": berachainTestnetConfig,
  "telos-testnet": telosTestnetConfig,
  telos: telosConfig,
  abstract: abstractConfig,
  "abstract-testnet": abstractTestnetConfig,
  viction: victionMainnetConfig,
  "viction-testnet": victionTestnetConfig,
  zkCandy: zkCandyConfig,
  "zkCandy-testnet": zkCandyTestnetConfig,
  hedera: hederaMainnetConfig,
  "hedera-testnet": hederaTestnetConfig,
  goat: goatMainnetConfig,
  "goat-testnet": goatTestnetConfig,
  settlus: settlusConfig,
  "settlus-testnet": settlusTestnetConfig,
}

export const ethereumNetworks = Object.keys(configDictionary) as Array<keyof typeof configDictionary>

export function getEthereumConfig(env: EthereumNetwork): EthereumConfig {
  return configDictionary[env]
}

export type GetConfigByChainId = () => Promise<EthereumConfig>

const dictionaryFlat = Object.values(configDictionary)
export function getNetworkConfigByChainId(chainId: number): EthereumConfig {
  const config = dictionaryFlat.find((x: EthereumConfig) => x.chainId === chainId)
  if (!config) throw new Error(`ChainID ${chainId} is not found in list of supported chains`)
  return config
}
