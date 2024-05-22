import type { Maybe } from "@rarible/types/build/maybe"
import type { Ethereum } from "@rarible/ethereum-provider"
import type { Auction } from "@rarible/ethereum-api-client/build/models"
import type { SendFunction } from "../common/send-transaction"
import type { RaribleEthereumApis } from "../common/apis"
import type { GetConfigByChainId } from "../config"
import { createEthereumAuctionContract } from "./contracts/auction"

export async function finishAuction(
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

  validateFinishAuction(auction)
  const config = await getConfig()

  return send(createEthereumAuctionContract(ethereum, config.auction).functionCall("finishAuction", auction.auctionId))
}

function validateFinishAuction(auction: Auction) {
  if (!auction.lastBid) {
    throw new Error("Auction without bid can't be finished")
  }
  if (auction.endTime) {
    const endTime = new Date(auction.endTime).getTime()

    if (endTime > 0 && endTime < Date.now()) {
      throw new Error("Auction is not finished")
    }
  }
}
