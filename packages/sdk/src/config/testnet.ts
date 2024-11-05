import { AptosNetwork } from "@rarible/aptos-sdk"
import type { RaribleSdkConfig } from "./domain"

export const testnetConfig: RaribleSdkConfig = {
  basePath: "https://testnet-api.rarible.org",
  ethereumEnv: "testnet",
  flowEnv: "testnet",
  tezosNetwork: "testnet",
  polygonNetwork: "mumbai",
  solanaNetwork: "devnet",
  eclipseAddress: "https://testnet.dev2.eclipsenetwork.xyz",
  immutablexNetwork: "testnet",
  mantleNetwork: "testnet-mantle",
  arbitrumNetwork: "testnet-arbitrum",
  aptosNetwork: AptosNetwork.TESTNET,
  zksync: "testnet-zksync",
  chiliz: "testnet-chiliz",
  lightlink: "testnet-lightlink",
  rari: "testnet-rari",
  base: "base-sepolia",
  xai: "testnet-xai",
  fief: "testnet-fief",
  kroma: "testnet-kroma",
  celo: "testnet-celo",
}
