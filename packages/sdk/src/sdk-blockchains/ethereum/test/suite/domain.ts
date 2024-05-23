import { Blockchain } from "@rarible/api-client"
import type {
  TestSuiteHookedProvider,
  TestSuiteProviderDictionary,
  TestSuiteSDKConfig,
} from "../../../../common/suite/domain"

export const evmSuiteSupportedBlockchains = [Blockchain.ETHEREUM, Blockchain.POLYGON] as const

export type EVMSuiteSupportedBlockchain = (typeof evmSuiteSupportedBlockchains)[number]

export type EVMSuiteProvider<T extends EVMSuiteSupportedBlockchain> = TestSuiteProviderDictionary[T]

export type EVMSuiteHookedProvider<T extends EVMSuiteSupportedBlockchain> = TestSuiteHookedProvider<T>

export type EVMSuiteTestConfig = TestSuiteSDKConfig
