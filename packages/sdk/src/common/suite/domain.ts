import { Blockchain } from "@rarible/api-client"
import type { Web3v4Ethereum } from "@rarible/web3-v4-ethereum"
import type { IRaribleSdkConfig } from "../../domain"

export const suiteSupportedBlockchains = [Blockchain.ETHEREUM, Blockchain.POLYGON] as const
export type SuiteSupportedBlockchain = typeof suiteSupportedBlockchains[number]

export interface TestSuiteProviderDictionary extends Record<SuiteSupportedBlockchain, any> {
	[Blockchain.ETHEREUM]: Web3v4Ethereum
	[Blockchain.POLYGON]: Web3v4Ethereum
}

export type TestSuiteHookedProvider<T extends SuiteSupportedBlockchain> = {
	provider: TestSuiteProviderDictionary[T]
	start: () => Promise<void> | void
	destroy: () => Promise<void> | void
}

export type TestSuiteSDKConfig = Partial<Omit<IRaribleSdkConfig, "logs">>
