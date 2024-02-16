import type { RaribleSdkConfig } from "./domain"

export const developmentConfig: RaribleSdkConfig = {
	basePath: "https://dev-api.rarible.org",
	ethereumEnv: "dev-ethereum",
	flowEnv: "dev-testnet",
	tezosNetwork: "dev",
	polygonNetwork: "dev-polygon",
	solanaNetwork: "devnet",
	immutablexNetwork: "testnet",
	mantleNetwork: "testnet-mantle",
	arbitrumNetwork: "testnet-arbitrum",
	zksync: "testnet-zksync",
	chiliz: "testnet-chiliz",
	lightlink: "testnet-lightlink",
	rari: "testnet-rari",
	base: "base-sepolia",
}
