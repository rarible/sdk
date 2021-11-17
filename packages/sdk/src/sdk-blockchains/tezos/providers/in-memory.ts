// eslint-disable-next-line camelcase
import { in_memory_provider } from "tezos-sdk-module/dist/providers/in_memory/in_memory_provider"
import BigNumber from "bignumber.js"

export function createInMemoryProvider(node: string) {
	return {
		tezos: in_memory_provider(
			"edsk3UUamwmemNBJgDvS8jXCgKsvjL2NoTwYRFpGSRPut4Hmfs6dG8",
			node
		),
		config: {
			exchange: "KT1C5kWbfzASApxCMHXFLbHuPtnRaJXE4WMu",
			fees: new BigNumber(0),
			nft_public: "",
			mt_public: "",
		},
	}
}
