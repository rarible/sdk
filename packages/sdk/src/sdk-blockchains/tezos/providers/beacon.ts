// eslint-disable-next-line camelcase
import { beacon_provider } from "tezos-sdk-module/dist/providers/beacon/beacon_provider"
import type { TezosProviderResponse } from "../domain"

export async function createBeaconProvider(node: string): Promise<TezosProviderResponse> {
	return {
		tezos: await beacon_provider({ node }),
		config: {
			exchange: "KT1XgQ52NeNdjo3jLpbsPBRfg8YhWoQ5LB7g",
			fees: BigInt(0),
		},
	}
}
