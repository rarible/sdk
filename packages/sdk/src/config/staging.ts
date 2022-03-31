import type { RaribleSdkConfig } from "./domain"

export const stagingConfig: RaribleSdkConfig = {
	basePath: "https://api-staging.rarible.org",
	ethereumEnv: "rinkeby",
	flowEnv: "staging",
	tezosNetwork: "hangzhou",
	polygonNetwork: "mumbai",
	solanaNetwork: "devnet",
}
