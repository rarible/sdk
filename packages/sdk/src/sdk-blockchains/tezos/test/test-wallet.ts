// eslint-disable-next-line camelcase
import { in_memory_provider } from "tezos-sdk-module/dist/providers/in_memory/in_memory_provider"
import { TezosWallet } from "@rarible/sdk-wallet"

export function createTestWallet(edsk: string) {
	return new TezosWallet(
		in_memory_provider(
			edsk,
			"https://hangzhou.tz.functori.com"
		)
	)
}
