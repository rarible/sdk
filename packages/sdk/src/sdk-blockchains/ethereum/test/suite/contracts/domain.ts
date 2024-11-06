import type { Blockchain } from "@rarible/api-client"
import type { EVMSuiteSupportedBlockchain } from "../domain"
import type { ERC1155Contract } from "./variants/erc1155"
import type { ERC20Mintable } from "./variants/erc20-mintable"
import type { ERC20Wrapped } from "./variants/erc20-wrapped"
import type { ERC721Contract } from "./variants/erc721"
import type { EVMNativeToken } from "./variants/native"

export const evmKnownTestContracts = ["erc20_mintable_1", "wrapped_eth", "eth", "erc721_1", "erc1155_1"] as const
export type EVMKnownTestContract = (typeof evmKnownTestContracts)[number]

export interface EVMContractsDictionary<T extends EVMSuiteSupportedBlockchain>
  extends Record<EVMKnownTestContract, any> {
  erc20_mintable_1: ERC20Mintable<T>
  wrapped_eth: ERC20Wrapped<T>
  eth: EVMNativeToken<T>
  erc721_1: ERC721Contract<T>
  erc1155_1: ERC1155Contract<T>
}

export type EVMContracts = Exclude<EVMKnownTestContract, "eth">
export type EVMContractsByBlockchain = {
  [Blockchain.ETHEREUM]: Record<EVMContracts, string>
  [Blockchain.POLYGON]: Record<EVMContracts, string>
}

export const evmDeployableTestContracts = ["erc20"] as const
export type EVMDeployableTestContract = (typeof evmDeployableTestContracts)[number]

export interface EVMDeployContractType<T extends EVMSuiteSupportedBlockchain>
  extends Record<EVMDeployableTestContract, any> {
  erc20: ERC20Mintable<T>
}
