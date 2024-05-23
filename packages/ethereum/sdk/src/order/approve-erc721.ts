import type { Address } from "@rarible/ethereum-api-client"
import type { Ethereum, EthereumTransaction } from "@rarible/ethereum-provider"
import type { Maybe } from "@rarible/types/build/maybe"
import type { SendFunction } from "../common/send-transaction"
import { createErc721Contract } from "./contracts/erc721"

export async function approveErc721(
  ethereum: Maybe<Ethereum>,
  send: SendFunction,
  contract: Address,
  owner: Address,
  operator: Address,
): Promise<EthereumTransaction | undefined> {
  if (!ethereum) {
    throw new Error("Wallet undefined")
  }
  const erc721 = createErc721Contract(ethereum, contract)
  let allowance: boolean
  try {
    allowance = await erc721.functionCall("isApprovedForAll", owner, operator).call()
  } catch (e) {
    allowance = false
  }
  if (!allowance) {
    return await send(erc721.functionCall("setApprovalForAll", operator, true))
  }
  return undefined
}
