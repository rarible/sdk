import type { Ethereum, EthereumTransaction } from "@rarible/ethereum-provider"
import type { Address } from "@rarible/types"
import type { EVMAddress } from "@rarible/types"
import { toEVMAddress } from "@rarible/types"
import type { SendFunction } from "../common/send-transaction"
import { createCryptoPunksMarketContract } from "./contracts/cryptoPunks"

export async function transferCryptoPunk(
  ethereum: Ethereum,
  send: SendFunction,
  contract: Address | EVMAddress,
  to: Address | EVMAddress,
  punkIndex: number,
): Promise<EthereumTransaction> {
  const cryptoPunkMarket = createCryptoPunksMarketContract(ethereum, toEVMAddress(contract))
  return send(cryptoPunkMarket.functionCall("transferPunk", to, punkIndex))
}
