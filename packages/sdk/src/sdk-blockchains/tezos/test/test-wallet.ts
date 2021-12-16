// eslint-disable-next-line camelcase
import { in_memory_provider } from "tezos-sdk-module/dist/providers/in_memory/in_memory_provider"
import { TezosWallet } from "@rarible/sdk-wallet"

export function createTestWallet(edsk: string) {
	return new TezosWallet(
		in_memory_provider(
			edsk,
			"http://a0e521d4ae6544ae0845868a990a0449-1808125768.eu-west-1.elb.amazonaws.com:8732"
		)
	)
}
