// eslint-disable-next-line camelcase
import { beacon_provider } from "tezos/sdk/providers/beacon/beacon_provider"

export async function createBeaconProvider({ node }: {node: string}) {
	const config = {
		exchange: "KT1XgQ52NeNdjo3jLpbsPBRfg8YhWoQ5LB7g",
		fees: 0n,
	}

	return beacon_provider({ node })
}
