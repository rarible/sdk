import type { EthereumNetwork } from "@rarible/protocol-ethereum-sdk/build/types"
import type { SolanaCluster } from "@rarible/solana-sdk"
import type { ImxEnv } from "@rarible/immutable-wallet"
import type { FlowEnv } from "@rarible/flow-sdk"
import type { SupportedNetwork as SupportedAptosNetwork } from "@rarible/aptos-sdk"

export type RaribleSdkEnvironment = "development" | "testnet" | "prod"

export type RaribleSdkConfig = {
  basePath: string
  ethereumEnv: EthereumNetwork
  flowEnv: FlowEnv
  polygonNetwork: EthereumNetwork
  solanaNetwork: SolanaCluster
  eclipseAddress: string
  immutablexNetwork: ImxEnv
  mantleNetwork: EthereumNetwork
  arbitrumNetwork: EthereumNetwork
  aptosNetwork: SupportedAptosNetwork
  zksync: EthereumNetwork
  chiliz: EthereumNetwork
  lightlink: EthereumNetwork
  rari: EthereumNetwork
  base: EthereumNetwork
  fief?: EthereumNetwork
  kroma?: EthereumNetwork
  celo: EthereumNetwork
}
