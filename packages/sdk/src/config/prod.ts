import { AptosNetwork } from "@rarible/aptos-sdk/build/domain"
import type { RaribleSdkConfig } from "./domain"

export const prodConfig: RaribleSdkConfig = {
  basePath: "https://api.rarible.org",
  ethereumEnv: "mainnet",
  flowEnv: "mainnet",
  tezosNetwork: "mainnet",
  polygonNetwork: "polygon",
  solanaNetwork: "mainnet-beta",
  eclipseAddress: "https://mainnetbeta-rpc.eclipse.xyz",
  immutablexNetwork: "prod",
  mantleNetwork: "mantle",
  arbitrumNetwork: "arbitrum",
  aptosNetwork: AptosNetwork.MAINNET,
  zksync: "zksync",
  chiliz: "chiliz",
  lightlink: "lightlink",
  rari: "rari",
  base: "base",
  xai: "testnet-xai",
  fief: "testnet-fief",
  kroma: "testnet-kroma",
  celo: "testnet-celo",
}
