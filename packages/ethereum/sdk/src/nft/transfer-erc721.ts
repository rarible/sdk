import type { EVMAddress } from "@rarible/types"
import type { Ethereum, EthereumTransaction } from "@rarible/ethereum-provider"
import { createErc721Contract } from "../order/contracts/erc721"
import type { SendFunction } from "../common/send-transaction"

export async function transferErc721(
  ethereum: Ethereum,
  send: SendFunction,
  contract: EVMAddress,
  from: EVMAddress,
  to: EVMAddress,
  tokenId: string,
): Promise<EthereumTransaction> {
  const erc721 = createErc721Contract(ethereum, contract)
  return send(erc721.functionCall("safeTransferFrom", from, to, tokenId))
}
