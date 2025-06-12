import { AptosNetwork } from "@rarible/aptos-sdk/build/domain"
import type { RaribleSdkConfig } from "./domain"

export const developmentConfig: RaribleSdkConfig = {
  basePath: "https://dev-api.rarible.org",
  ethereumEnv: "dev-ethereum",
  flowEnv: "dev-testnet",
  polygonNetwork: "dev-polygon",
  solanaNetwork: "devnet",
  eclipseAddress: "https://staging-rpc.dev2.eclipsenetwork.xyz",
  immutablexNetwork: "testnet",
  mantleNetwork: "testnet-mantle",
  arbitrumNetwork: "testnet-arbitrum",
  aptosNetwork: AptosNetwork.TESTNET,
  zksync: "testnet-zksync",
  chiliz: "testnet-chiliz",
  lightlink: "testnet-lightlink",
  rari: "testnet-rari",
  base: "base-sepolia",
  fief: "testnet-fief",
  kroma: "testnet-kroma",
  celo: "testnet-celo",
}
