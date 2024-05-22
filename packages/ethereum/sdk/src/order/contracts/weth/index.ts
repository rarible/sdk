import type { Ethereum, EthereumContract } from "@rarible/ethereum-provider"
import type { Address } from "@rarible/ethereum-api-client"
import { wethABI } from "./abi"

export function createWethContract(ethereum: Ethereum, address?: Address): EthereumContract {
  return ethereum.createContract(wethABI, address)
}
