import { createE2eProvider } from "@rarible/ethereum-sdk-test-common"
import Web3 from "web3"

export function initProviders({ pk1, pk2 } : { pk1?: string, pk2?: string }) {
	const { provider: provider1, wallet: wallet1 } = createE2eProvider(pk1)
	const { provider: provider2, wallet: wallet2 } = createE2eProvider(pk2)
	const web31 = new Web3(provider1)
	const web32 = new Web3(provider2)

	return {
		web31, web32, wallet1, wallet2,
	}
}

export function initProvider(pk?: string) {
	const { provider, wallet } = createE2eProvider(pk)
	return { provider, wallet, web3: new Web3(provider) }
}
