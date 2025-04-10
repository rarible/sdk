import type { Ethereum, EthereumTransaction } from "@rarible/ethereum-provider"
import type { EVMAddress } from "@rarible/types"
import type { Maybe } from "@rarible/types"
import type { SendFunction } from "../common/send-transaction"
import { createCryptoPunksMarketContract } from "../nft/contracts/cryptoPunks"
import { HEDERAEVM_GAS_LIMIT, isHederaEvm } from "../common"

export async function approveCryptoPunk(
  ethereum: Maybe<Ethereum>,
  send: SendFunction,
  contractAddress: EVMAddress,
  owner: EVMAddress,
  operator: EVMAddress,
  punkIndex: number,
): Promise<EthereumTransaction | undefined> {
  if (!ethereum) {
    throw new Error("Wallet undefined")
  }
  const options = (await isHederaEvm(ethereum)) ? { gas: HEDERAEVM_GAS_LIMIT } : undefined
  const marketContract = createCryptoPunksMarketContract(ethereum, contractAddress)
  const offer = await marketContract.functionCall("punksOfferedForSale", punkIndex).call()
  if (
    offer.isForSale &&
    offer.onlySellTo.toLowerCase() === operator.toLowerCase() &&
    offer.minValue.toString() === "0"
  ) {
    return undefined
  } else {
    return send(marketContract.functionCall("offerPunkForSaleToAddress", punkIndex, 0, operator), options)
  }
}
