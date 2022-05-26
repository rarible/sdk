import type { RaribleSdkConfig } from "./domain"

export const e2eConfig: RaribleSdkConfig = {
	basePath: "https://api-e2e.rarible.org",
	ethereumEnv: "e2e",
	flowEnv: "dev",
	tezosNetwork: "testnet",
	polygonNetwork: "e2e",
	solanaNetwork: "devnet",
}
