import type { ConfigurationParameters } from "@rarible/ethereum-api-client"
import type { EthereumNetwork } from "../types"

export function getApiConfig(
	env: EthereumNetwork,
	additional: ConfigurationParameters = {}
): ConfigurationParameters {
	return {
		basePath: getBasePathByEnv(env),
		...additional,
	}
}

export function getBasePathByEnv(env: EthereumNetwork): string {
	switch (env) {
		case "dev-polygon":
		case "dev-ethereum":
			return "https://dev-api.rarible.org"
		case "testnet":
		case "mumbai":
		case "testnet-mantle":
			return "https://testnet-api.rarible.org"
		case "staging":
		case "staging-polygon":
			return "https://staging-api.rarible.org"
		case "polygon":
		case "mainnet":
		case "mantle":
			return "https://api.rarible.org"
		default:
			throw new Error(`Env ${env} is not supported yet`)
	}
}
