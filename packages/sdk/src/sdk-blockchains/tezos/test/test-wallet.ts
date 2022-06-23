// eslint-disable-next-line camelcase
import { in_memory_provider } from "@rarible/tezos-sdk/dist/providers/in_memory/in_memory_provider"
import { TezosWallet } from "@rarible/sdk-wallet"
import type { RaribleSdkEnvironment } from "../../../config/domain"


export function getNodeForEnv(env: RaribleSdkEnvironment): string {
	switch (env) {
		case "development": return "https://dev-tezos-node.rarible.org"
		case "dev":
		case "testnet":
		case "staging": return "https://rpc.tzkt.io/ithacanet"
		case "prod": return "https://rpc.tzkt.io/mainnet"
		default: throw new Error("Cannot get node for env")
	}

}
export function createTestWallet(edsk: string, env: RaribleSdkEnvironment) {
	return new TezosWallet(
		in_memory_provider(
			edsk,
			getNodeForEnv(env)
		)
	)
}
