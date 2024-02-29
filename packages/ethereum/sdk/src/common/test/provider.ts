import type { E2EProviderConfig } from "@rarible/ethereum-sdk-test-common"
import { createE2eProvider as createE2EProviderBase } from "@rarible/ethereum-sdk-test-common"
import type { E2EProviderSupportedNetwork } from "./domain"
import { SPONSOR_PK_1 } from "./test-credentials"

export function createSponsorProvider(network: E2EProviderSupportedNetwork) {
	return createE2EProviderBase(SPONSOR_PK_1, e2eProviderConfigs[network])
}

export function createE2EProviderWithPk(network: E2EProviderSupportedNetwork, pk: string) {
	return createE2EProviderBase(pk, e2eProviderConfigs[network])
}

export function createE2EProviderEmpty(network: E2EProviderSupportedNetwork) {
	return createE2EProviderBase(undefined, e2eProviderConfigs[network])
}

const e2eProviderConfigs: Record<E2EProviderSupportedNetwork, Partial<E2EProviderConfig>> = {
	"dev-ethereum": {
		rpcUrl: "https://dev-ethereum-node.rarible.com",
		networkId: 300500,
	},
	mumbai: {
		rpcUrl: "https://node-mumbai.rarible.com",
		networkId: 80001,
	},
	polygon: {
		rpcUrl: "https://node-mainnet-polygon.rarible.com",
		networkId: 137,
	},
	testnet: {
		rpcUrl: "https://goerli-ethereum-node.rarible.com",
		networkId: 5,
	},
	mainnet: {
		rpcUrl: "https://node-mainnet.rarible.com",
		networkId: 1,
	},
}
