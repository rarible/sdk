import type { Provider } from "tezos-sdk-module/dist/common/base"
import type { TezosNetwork } from "../domain"
import { createInMemoryProvider } from "./in-memory"
import { createBeaconProvider } from "./beacon"

export function getProviderUrls(network: TezosNetwork) {
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
		default:
			throw new Error(`Unsupported ${network} network`)
	}
}

export async function createProvider(network: TezosNetwork): Promise<Provider> {
	const { apiUrl, node } = getProviderUrls(network)

	switch (network) {
		case "local": {
			return {
				...createInMemoryProvider(node),
				api: apiUrl,
			}
		}
		case "granada": {
			return {
				...(await createBeaconProvider(node)),
				api: apiUrl,
			}
		}
		default:
			throw new Error("Unsupported tezos network")
	}
}
