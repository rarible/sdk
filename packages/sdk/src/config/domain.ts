import type { EthereumNetwork } from "../sdk-blockchains/ethereum/domain"
import type { FlowNetwork } from "../sdk-blockchains/flow/domain"

export type RaribleSdkEnvironment = "dev" | "e2e" | "staging" | "prod"

export type RaribleSdkConfig = {
	basePath: string
	ethereumEnv: EthereumNetwork
	flowEnv: FlowNetwork
}
