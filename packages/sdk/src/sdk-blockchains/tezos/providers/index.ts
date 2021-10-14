import { TezosProvider, Provider } from "tezos/sdk/common/base"
import { Config } from "tezos/sdk/config/type"
import { createInMemoryProvider } from "./in-memory"
import { createBeaconProvider } from "./beacon"

export async function createProvider(): Promise<Provider> {
	const urls = {
		api_url: "http://localhost:8080/v0.1/",
		node: "https://granada.tz.functori.com",
	}

	// const tezos = await createBeaconProvider({ node: urls.node })
	const { tezos, config, api } = await createInMemoryProvider({ node: urls.node, apiUrl: urls.api_url })

	return {
		tezos,
		api,
		config,
	}
}
