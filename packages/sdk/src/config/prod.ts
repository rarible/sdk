import type { RaribleSdkConfig } from "./domain"

export const prodConfig: RaribleSdkConfig = {
	basePath: "https://api.rarible.org",
	ethereumEnv: "mainnet",
	flowEnv: "mainnet",
	tezosNetwork: "mainnet",
	polygonNetwork: "polygon",
	solanaNetwork: "mainnet-beta",
}
