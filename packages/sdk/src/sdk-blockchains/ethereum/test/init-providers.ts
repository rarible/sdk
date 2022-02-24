import { createE2eProvider } from "@rarible/ethereum-sdk-test-common"
import Web3 from "web3"

type ProvidersConfig = Partial<{
	pk1: string
	pk2: string
}>

export function initProviders({ pk1, pk2 }: ProvidersConfig = {}) {
	const { provider: provider1, wallet: wallet1 } = createE2eProvider(pk1)
	const { provider: provider2, wallet: wallet2 } = createE2eProvider(pk2)

	return {
		web31: new Web3(provider1),
		web32: new Web3(provider2),
		wallet1,
		wallet2,
	}
}

export function initProvider(...args: Parameters<typeof createE2eProvider>) {
	const { provider, wallet } = createE2eProvider(...args)
	return {
		provider,
		wallet,
		web3: new Web3(provider),
	}
}
