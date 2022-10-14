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
	goerli: {
		network: "goerli",
		linkAddress: "https://link.sandbox.x.immutable.com",
		gasPrice: "4000000",
		gasLimit: "7000000",
		enableDebug: true,
	},
}

export const IMX_ENV_CONFIG: Record<ImxEnv, ImxNetworkConfig> = {
	testnet: IMX_NETWORK_CONFIG.goerli,
	prod: IMX_NETWORK_CONFIG.mainnet,
}
