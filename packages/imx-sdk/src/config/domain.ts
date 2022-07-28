import type { Part } from "@rarible/ethereum-api-client"
import type { ImxEnv, ImxNetworkConfig } from "@rarible/immutable-wallet"

export type ImxProtocolFee = {
	sellerFee: Part
	buyerFee: Part
}

export type ImxSdkConfig = {
	apiAddressV1: string
	apiAddressV2: string
	protocolFee: ImxProtocolFee
}

export type ImxSdkEnvConfig = Record<ImxEnv, ImxSdkConfig & ImxNetworkConfig>
