import type { ImxEnv, ImxNetworkConfig } from "@rarible/immutable-wallet"

export type ImxProtocolFee = {
	sellerFee: number
	buyerFee: number
}

export type ImxSdkConfig = {
	apiAddressV1: string
	apiAddressV2: string
}

export type ImxSdkEnvConfig = Record<ImxEnv, ImxSdkConfig & ImxNetworkConfig>
