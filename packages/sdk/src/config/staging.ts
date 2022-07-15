import type { RaribleSdkConfig } from "./domain"

export const stagingConfig: RaribleSdkConfig = {
	basePath: "https://api-staging.rarible.org",
	ethereumEnv: "rinkeby",
	flowEnv: "testnet",
	tezosNetwork: "testnet",
	polygonNetwork: "mumbai",
	solanaNetwork: "devnet",
}
