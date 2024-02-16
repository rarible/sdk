import { toBn } from "@rarible/utils"
import type { EVMBlockchain } from "@rarible/sdk-common"
import { Blockchain } from "@rarible/api-client"
import { configDictionary, getEthereumConfig } from "../config"
import type { EthereumNetwork } from "../types"

export const ETHER_IN_WEI = toBn(10).pow(18)

export function getNetworkFromChainId(chainId: number) {
	const network = Object.keys(configDictionary)
		.find((network) => {
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
	switch (network) {
		case "testnet":
		case "dev-ethereum":
		case "mainnet":
			return Blockchain.ETHEREUM
		case "dev-polygon":
		case "mumbai":
		case "polygon":
			return Blockchain.POLYGON
		case "mantle":
		case "testnet-mantle":
			return Blockchain.MANTLE
		case "arbitrum":
		case "testnet-arbitrum":
			return Blockchain.ARBITRUM
		case "zksync":
		case "testnet-zksync":
			return Blockchain.ZKSYNC
		case "chiliz":
		case "testnet-chiliz":
			return Blockchain.CHILIZ
		case "lightlink":
		case "testnet-lightlink":
			return Blockchain.LIGHTLINK
		case "rari":
		case "testnet-rari":
			return Blockchain.RARI
		case "zkatana":
			return Blockchain.ASTARZKEVM
		case "base":
		case "base-sepolia":
			return Blockchain.BASE
		default: throw new Error(`Unrecognized ethereum network ${network}`)
	}
}

export function getChainIdByNetwork(network: EthereumNetwork): number {
	const config = getEthereumConfig(network)
	if (!config) throw new Error(`Config for network=${network} has not been found`)
	return config.chainId
}
