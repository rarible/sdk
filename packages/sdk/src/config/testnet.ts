import type { RaribleSdkConfig } from "./domain"

export const testnetConfig: RaribleSdkConfig = {
	basePath: "https://testnet-api.rarible.org",
	ethereumEnv: "testnet",
	flowEnv: "staging",
	tezosNetwork: "testnet",
	polygonNetwork: "mumbai",
	solanaNetwork: "devnet",
}
