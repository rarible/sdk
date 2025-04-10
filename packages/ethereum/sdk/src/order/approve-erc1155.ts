import type { EVMAddress } from "@rarible/types"
import type { EthereumTransaction } from "@rarible/ethereum-provider"
import type { Maybe } from "@rarible/types"
import type { Ethereum } from "../../../ethereum-provider"
import type { SendFunction } from "../common/send-transaction"
import { createErc1155Contract } from "./contracts/erc1155"
import { HEDERAEVM_GAS_LIMIT, isHederaEvm } from "../common"

export async function approveErc1155(
  ethereum: Maybe<Ethereum>,
  send: SendFunction,
  contract: EVMAddress,
  owner: EVMAddress,
  operator: EVMAddress,
): Promise<EthereumTransaction | undefined> {
  if (!ethereum) {
    throw new Error("Wallet undefined")
  }
  const options = (await isHederaEvm(ethereum)) ? { gas: HEDERAEVM_GAS_LIMIT } : undefined
  const erc1155 = createErc1155Contract(ethereum, contract)
  let allowance: boolean
  try {
    allowance = await erc1155.functionCall("isApprovedForAll", owner, operator).call()
  } catch (e) {
    allowance = false
  }
  if (!allowance) {
    return send(erc1155.functionCall("setApprovalForAll", operator, true), options)
  }
  return undefined
}
