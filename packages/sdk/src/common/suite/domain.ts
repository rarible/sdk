import { Blockchain } from "@rarible/api-client"
import type { Web3Ethereum } from "@rarible/web3-ethereum/build"
import type { IRaribleSdkConfig } from "../../domain"

export const suiteSupportedBlockchains = [Blockchain.ETHEREUM] as const
export type SuiteSupportedBlockchain = (typeof suiteSupportedBlockchains)[number]

export interface TestSuiteProviderDictionary extends Record<SuiteSupportedBlockchain, any> {
  [Blockchain.ETHEREUM]: Web3Ethereum
  [Blockchain.POLYGON]: Web3Ethereum
}

export type TestSuiteHookedProvider<T extends SuiteSupportedBlockchain> = {
  provider: TestSuiteProviderDictionary[T]
  start: () => Promise<void> | void
  destroy: () => Promise<void> | void
}

export type TestSuiteSDKConfig = Partial<Omit<IRaribleSdkConfig, "logs">>
