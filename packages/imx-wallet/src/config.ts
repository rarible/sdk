import type { ImxEnv } from "./domain"
import type { ImxNetwork, ImxNetworkConfig } from "./domain"

export const IMX_NETWORK_CONFIG: Record<ImxNetwork, ImxNetworkConfig> = {
	mainnet: {
		network: "mainnet",
		linkAddress: "https://link.x.immutable.com",
		gasPrice: "4000000",
		gasLimit: "7000000",
		enableDebug: false,
	},
	ropsten: {
		network: "ropsten",
		linkAddress: "https://link.ropsten.x.immutable.com",
		gasPrice: "4000000",
		gasLimit: "7000000",
		enableDebug: true,
	},
}

export const IMX_ENV_CONFIG: Record<ImxEnv, ImxNetworkConfig> = {
	dev: IMX_NETWORK_CONFIG.ropsten,
	prod: IMX_NETWORK_CONFIG.mainnet,
}
