import type { Maybe } from "@rarible/types/build/maybe"
import type { Ethereum } from "@rarible/ethereum-provider"
import type { SendFunction } from "../common/send-transaction"
import type { RaribleEthereumApis } from "../common/apis"
import type { GetConfigByChainId } from "../config"
import { createEthereumAuctionContract } from "./contracts/auction"

export async function cancelAuction(
  ethereum: Maybe<Ethereum>,
  send: SendFunction,
  getConfig: GetConfigByChainId,
  getApis: () => Promise<RaribleEthereumApis>,
  hash: string,
) {
  if (!ethereum) {
    throw new Error("Wallet is undefined")
  }
  const apis = await getApis()
  const auction = await apis.auction.getAuctionByHash({ hash })
  const sender = await ethereum.getFrom()
  if (auction.seller.toLowerCase() !== sender.toLowerCase()) {
    throw new Error("This operation is allowed only for auction owner")
  }
  if (auction.lastBid) {
    throw new Error("Can't cancel auction with bid")
  }
  const config = await getConfig()

  return send(createEthereumAuctionContract(ethereum, config.auction).functionCall("cancel", auction.auctionId))
}
