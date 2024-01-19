import { createE2eProvider } from "@rarible/ethereum-sdk-test-common"
import { ETH_DEV_SETTINGS } from "./common"

type ProvidersConfig = Partial<{
	pk1: string
	pk2: string
}>

export function initProviders(
	{ pk1, pk2 }: ProvidersConfig = {},
	providerSettings = ETH_DEV_SETTINGS
) {
	const { provider: provider1, wallet: wallet1, web3: web31 } = createE2eProvider(pk1, providerSettings)
	const { provider: provider2, wallet: wallet2, web3: web32 } = createE2eProvider(pk2, providerSettings)

	return {
		web31,
		web32,
		wallet1,
		wallet2,
		provider1,
		provider2,
	}
}

export function initProvider(...args: Parameters<typeof createE2eProvider>) {
	const { provider, wallet, web3 } = createE2eProvider(...args)
	return {
		provider,
		wallet,
		web3,
	}
}
