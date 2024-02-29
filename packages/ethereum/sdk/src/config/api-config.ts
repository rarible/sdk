import type { ConfigurationParameters } from "@rarible/ethereum-api-client"
import type { EthereumNetwork } from "../types"
import { getEthereumConfig } from "./index"

/**
 * @deprecated due to unnecessary dependency to getEthereumConfig
 */
export function getApiConfig(
	env: EthereumNetwork,
	additional: ConfigurationParameters = {}
): ConfigurationParameters {
	const config = getEthereumConfig(env)
	return {
		basePath: config.basePath,
		...additional,
	}
}
