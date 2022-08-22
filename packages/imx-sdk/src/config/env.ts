import type { ImxNetwork } from "@rarible/immutable-wallet"
import { IMX_NETWORK_CONFIG } from "@rarible/immutable-wallet"
import type { ImxSdkConfig, ImxSdkEnvConfig } from "./domain"

export const IMX_CONFIG: Record<ImxNetwork, ImxSdkConfig> = {
	mainnet: {
		apiAddressV1: "https://api.x.immutable.com/v1",
		apiAddressV2: "https://api.x.immutable.com/v2",
	},
	ropsten: {
		apiAddressV1: "https://api.ropsten.x.immutable.com/v1",
		apiAddressV2: "https://api.ropsten.x.immutable.com/v2",
	},
}

export const IMX_ENV_CONFIG: ImxSdkEnvConfig = {
	dev: {
		...IMX_NETWORK_CONFIG.ropsten,
		...IMX_CONFIG.ropsten,
	},
	prod: {
		...IMX_NETWORK_CONFIG.mainnet,
		...IMX_CONFIG.mainnet,
	},
}
