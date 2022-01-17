// eslint-disable-next-line camelcase
import { in_memory_provider } from "@rarible/tezos-sdk/dist/providers/in_memory/in_memory_provider"

export function createTestInMemoryProvider(edsk: string) {
	return in_memory_provider(edsk, "https://hangzhou.tz.functori.com")
}
