// eslint-disable-next-line camelcase
import { beacon_provider } from "tezos-sdk-module/dist/providers/beacon/beacon_provider"
import BigNumber from "bignumber.js"
import { TezosProviderResponse } from "../domain"

export async function createBeaconProvider({ node }: {node: string}): Promise<TezosProviderResponse> {
	const config = {
		exchange: "KT1XgQ52NeNdjo3jLpbsPBRfg8YhWoQ5LB7g",
		fees: new BigNumber(0),
	}

	return {
		tezos: await beacon_provider({ node }),
		config,
	}
}
