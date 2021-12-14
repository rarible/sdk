import type { FlowNetwork } from "@rarible/flow-sdk/build/types"
import type { EthereumNetwork } from "@rarible/protocol-ethereum-sdk/build/types"
import type { TezosNetwork } from "tezos-sdk-module/dist/common/base"

export type RaribleSdkEnvironment = "dev" | "e2e" | "staging" | "prod"

export type RaribleSdkConfig = {
	basePath: string
	ethereumEnv: EthereumNetwork
	flowEnv: FlowNetwork
	tezosNetwork: TezosNetwork
}
