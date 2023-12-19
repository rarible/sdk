import type { RaribleSdkConfig } from "./domain"

export const testnetConfig: RaribleSdkConfig = {
	basePath: "https://testnet-api.rarible.org",
	ethereumEnv: "testnet",
	flowEnv: "testnet",
	tezosNetwork: "testnet",
	polygonNetwork: "mumbai",
	solanaNetwork: "devnet",
	immutablexNetwork: "testnet",
	mantleNetwork: "testnet-mantle",
	arbitrumNetwork: "testnet-arbitrum",
	zksync: "testnet-zksync",
	lightlink: "testnet-lightlink",
}
