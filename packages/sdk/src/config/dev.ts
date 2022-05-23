import type { RaribleSdkConfig } from "./domain"

export const devConfig: RaribleSdkConfig = {
	basePath: "https://api-dev.rarible.org",
	ethereumEnv: "ropsten",
	flowEnv: "dev",
	tezosNetwork: "testnet",
	polygonNetwork: "mumbai-dev",
	solanaNetwork: "devnet",
}
