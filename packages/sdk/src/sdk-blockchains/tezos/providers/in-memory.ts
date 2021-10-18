// eslint-disable-next-line camelcase
import { in_memory_provider } from "tezos-sdk-module/dist/providers/in_memory/in_memory_provider"

export async function createInMemoryProvider({ node }: {node: string}) {
	const tezos = in_memory_provider(
		"edsk3UUamwmemNBJgDvS8jXCgKsvjL2NoTwYRFpGSRPut4Hmfs6dG8",
		node)

	const config = {
		exchange: "KT1C5kWbfzASApxCMHXFLbHuPtnRaJXE4WMu",
		fees: 0n,
	}

	return {
		tezos,
		config,
	}
}
