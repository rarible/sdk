import type { FlowEnv } from "@rarible/flow-sdk/build/types"
import type { EthereumNetwork } from "@rarible/protocol-ethereum-sdk/build/types"
import type { TezosNetwork } from "@rarible/tezos-sdk/dist/common/base"

export type RaribleSdkEnvironment = "dev" | "e2e" | "staging" | "prod"

export type RaribleSdkConfig = {
	basePath: string
	ethereumEnv: EthereumNetwork
	flowEnv: FlowEnv
	tezosNetwork: TezosNetwork,
	polygonNetwork: EthereumNetwork,
}
