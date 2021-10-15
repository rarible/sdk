import {  Provider } from "tezos/sdk/common/base"
// import { TezosNetwork } from "@rarible/sdk-wallet"
import { TezosNetwork } from "../../../../../wallet/src"
import { createInMemoryProvider } from "./in-memory"

// eslint-disable-next-line camelcase
export function getProviderUrls(network: TezosNetwork): { apiUrl: string, node: string } {
	switch (network) {
		case "granada": {
			return {
				apiUrl: "https://rarible-api.functori.com/v0.1",
				node: "https://granada.tz.functori.com",
			}
		}
		case "local": {
			return {
				apiUrl: "http://localhost:8080/v0.1",
				node: "https://granada.tz.functori.com",
			}
		}
		default: {
			throw new Error(`Unsupported ${network} network`)
		}
	}
}

export async function createProvider(network: TezosNetwork): Promise<Provider> {
	const { apiUrl, node } = getProviderUrls(network)

	// const tezos = await createBeaconProvider({ node: urls.node })
	const { tezos, config } = await createInMemoryProvider({ node })

	return {
		tezos,
		api: apiUrl,
		config,
	}
}
