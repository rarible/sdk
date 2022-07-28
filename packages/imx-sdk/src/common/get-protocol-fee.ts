import type { ImxEnv } from "@rarible/immutable-wallet"
import type { ImxProtocolFee } from "../config/domain"
import { IMX_ENV_CONFIG } from "../config/env"

export function getProtocolFee(network: ImxEnv): ImxProtocolFee {
	return IMX_ENV_CONFIG[network].protocolFee
}
