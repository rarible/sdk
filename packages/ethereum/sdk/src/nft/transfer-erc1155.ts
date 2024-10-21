import type { EVMAddress } from "@rarible/types"
import type { Ethereum, EthereumTransaction } from "@rarible/ethereum-provider"
import type { Address } from "@rarible/types"
import { createErc1155Contract } from "../order/contracts/erc1155"
import type { SendFunction } from "../common/send-transaction"

export async function transferErc1155(
  ethereum: Ethereum,
  send: SendFunction,
  contract: Address | EVMAddress,
  from: Address | EVMAddress,
  to: Address | EVMAddress,
  tokenId: string | string[],
  tokenAmount: string | string[],
): Promise<EthereumTransaction> {
  if (Array.isArray(tokenId) && Array.isArray(tokenAmount)) {
    if (tokenId.length === tokenAmount.length) {
      return sendTransaction(ethereum, send, contract, from, to, tokenId, tokenAmount)
    } else {
      throw new Error("Length of token amounts and token id's isn't equal")
    }
  } else {
    return sendTransaction(ethereum, send, contract, from, to, tokenId, tokenAmount)
  }
}

async function sendTransaction(
  ethereum: Ethereum,
  send: SendFunction,
  contract: Address | EVMAddress,
  from: Address | EVMAddress,
  to: Address | EVMAddress,
  tokenId: string | string[],
  tokenAmount: string | string[],
): Promise<EthereumTransaction> {
  const erc1155 = createErc1155Contract(ethereum, contract)
  if (Array.isArray(tokenId) && Array.isArray(tokenAmount)) {
    return send(erc1155.functionCall("safeBatchTransferFrom", from, to, tokenId, tokenAmount, "0x00"))
  }
  return send(erc1155.functionCall("safeTransferFrom", from, to, tokenId, tokenAmount, "0x00"))
}
