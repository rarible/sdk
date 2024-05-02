import type { EthereumNetwork } from "@rarible/protocol-ethereum-sdk/build/types"
import type { TezosNetwork } from "@rarible/tezos-sdk"
import type { SolanaCluster } from "@rarible/solana-sdk"
import type { ImxEnv } from "@rarible/immutable-wallet"
import type { FlowEnv } from "@rarible/flow-sdk"
import type { AptosSdkEnv } from "@rarible/aptos-sdk/src/domain"

export type RaribleSdkEnvironment = "development" | "testnet" | "prod"

export type RaribleSdkConfig = {
	basePath: string
	ethereumEnv: EthereumNetwork
	flowEnv: FlowEnv
	tezosNetwork: TezosNetwork,
	polygonNetwork: EthereumNetwork,
	solanaNetwork: SolanaCluster
	immutablexNetwork: ImxEnv
	mantleNetwork: EthereumNetwork
	arbitrumNetwork: EthereumNetwork
	aptosNetwork: AptosSdkEnv
	zksync: EthereumNetwork
	chiliz: EthereumNetwork
	lightlink: EthereumNetwork
	rari: EthereumNetwork
	base: EthereumNetwork
	xai: EthereumNetwork
	fief?: EthereumNetwork
	kroma?: EthereumNetwork
	celo: EthereumNetwork
}
