import type { E2EProviderConfig } from "@rarible/ethereum-sdk-test-common"
import { createE2eProvider as createE2eProviderCommon } from "@rarible/ethereum-sdk-test-common"
import { Web3, Web3Ethereum } from "@rarible/web3-ethereum"
import { Web3 as Web3v4, Web3v4Ethereum } from "@rarible/web3-v4-ethereum"
import { ETH_DEV_SETTINGS } from "./common"

type ProvidersConfig = Partial<{
	pk1: string
	pk2: string
}>

export function createE2eTestProvider(pk?: string, config?: Partial<E2EProviderConfig>) {
	const provider = createE2eProviderCommon(pk, config)

	const web3 = new Web3(provider as any)
	const web3v4 = new Web3v4(provider as any)

	web3v4.setConfig({ defaultTransactionType: "0x0" })

	return {
		...provider,
		web3,
		web3v4,
		web3Ethereum: new Web3Ethereum({ web3 }),
		web3v4Ethereum: new Web3v4Ethereum({ web3: web3v4 }),
	}
}

export function initProviders(
	{ pk1, pk2 }: ProvidersConfig = {},
	providerSettings = ETH_DEV_SETTINGS
) {
	const { provider: provider1, wallet: wallet1, web3: web31 } = createE2eTestProvider(pk1, providerSettings)
	const { provider: provider2, wallet: wallet2, web3: web32 } = createE2eTestProvider(pk2, providerSettings)

	return {
		web31,
		web32,
		wallet1,
		wallet2,
		provider1,
		provider2,
	}
}

export function initProvider(...args: Parameters<typeof createE2eTestProvider>) {
	const { provider, wallet, web3 } = createE2eTestProvider(...args)
	return {
		provider,
		wallet,
		web3,
	}
}
