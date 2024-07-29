import { toBn } from "@rarible/utils"
import type { EVMBlockchain } from "@rarible/sdk-common"
import { configDictionary, getEthereumConfig } from "../config"
import type { EthereumNetwork } from "../types"

export const ETHER_IN_WEI = toBn(10).pow(18)

export function getNetworkFromChainId(chainId: number) {
  const network = Object.keys(configDictionary).find(network => {
    const config = configDictionary[network as EthereumNetwork]
    return config.chainId === chainId
  })
  if (!network) {
    throw new Error(`Config for chainID=${chainId} has not been found`)
  }
  return network as EthereumNetwork
}
export function getBlockchainFromChainId(chainId: number): EVMBlockchain {
  const network = getNetworkFromChainId(chainId)
  return getBlockchainBySDKNetwork(network)
}
export function getBlockchainBySDKNetwork(network: EthereumNetwork): EVMBlockchain {
  if (!configDictionary[network]?.blockchain) {
    throw new Error(`Unrecognized ethereum network ${network}`)
  }
  return configDictionary[network].blockchain
}

export function getChainIdByNetwork(network: EthereumNetwork): number {
  const config = getEthereumConfig(network)
  if (!config) throw new Error(`Config for network=${network} has not been found`)
  return config.chainId
}
