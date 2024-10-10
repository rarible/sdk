import type { Ethereum, EthereumContract } from "@rarible/ethereum-provider"
import type { EVMAddress } from "@rarible/types"
import { wethABI } from "./abi"

export function createWethContract(ethereum: Ethereum, address?: EVMAddress): EthereumContract {
  return ethereum.createContract(wethABI, address)
}
