// eslint-disable-next-line camelcase
import { in_memory_provider } from "tezos-sdk-module/dist/providers/in_memory/in_memory_provider"
import BigNumber from "bignumber.js"

export function createInMemoryProvider(node: string) {
	return {
		tezos: in_memory_provider(
			"",
			node
		),
		config: {
			exchange: "KT1AguExF32Z9UEKzD5nuixNmqrNs1jBKPT8",
			fees: new BigNumber(0),
			nft_public: "",
			mt_public: "",
		},
	}
}
