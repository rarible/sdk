import { Provider } from "tezos-sdk-module/dist/common/base"
import { TezosNetwork } from "@rarible/sdk-wallet"
import { createInMemoryProvider } from "./in-memory"
import { createBeaconProvider } from "./beacon"

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

	if (network === "local") {
		const response = await createInMemoryProvider({ node })
		return {
			...response,
			api: apiUrl,
		}
	} else if (network === "granada") {
		const response = await createBeaconProvider({ node: node })
		return {
			...response,
			api: apiUrl,
		}
	} else {
		throw new Error("Unsupported tezos network")
	}
}
