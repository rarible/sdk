import { toBn } from "@rarible/utils"
import type { EVMBlockchain } from "@rarible/sdk-common"
import { configDictionary, getEthereumConfig } from "../config"
import type { EthereumNetwork } from "../types"
import type { Ethereum } from "@rarible/ethereum-provider"
import { hederaTestnetConfig } from "../config/hedera-testnet"
import { hederaMainnetConfig } from "../config/hedera"

export const ETHER_IN_WEI = toBn(10).pow(18)
export const HBAR_IN_TINYBAR = toBn(10).pow(8)
export const MULTIPLICATOR_FOR_HBAR_IN_RPC_REQUST = toBn(10).pow(10)
export const HEDERAEVM_GAS_LIMIT = 8_000_000

export async function isHederaEvm(ethereum: Ethereum) {
  const chainId = await ethereum.getChainId()
  return chainId === hederaTestnetConfig.chainId || chainId === hederaMainnetConfig.chainId
}

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
