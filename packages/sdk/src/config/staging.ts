import type { RaribleSdkConfig } from "./domain"

export const stagingConfig: RaribleSdkConfig = {
	basePath: "https://staging-api.rarible.org",
	ethereumEnv: "staging",
	flowEnv: "testnet",
	tezosNetwork: "testnet",
	polygonNetwork: "staging-polygon",
	solanaNetwork: "devnet",
	immutablexNetwork: "testnet",
	mantleNetwork: "testnet-mantle",
	arbitrumNetwork: "testnet-arbitrum",
	zksync: "testnet-zksync",
}
