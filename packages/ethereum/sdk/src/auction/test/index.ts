import type { AuctionControllerApi } from "@rarible/ethereum-api-client"
import { retry } from "../../common/retry"

export async function awaitForAuction(auctionApi: AuctionControllerApi, auctionHash: string) {
	return retry(8, 2000, async () => {
		return auctionApi.getAuctionByHash({ hash: auctionHash })
	})
}

export async function awaitForAuctionBid(auctionApi: AuctionControllerApi, auctionHash: string) {
	return retry(8, 2000, async () => {
		const auction = await auctionApi.getAuctionByHash({ hash: auctionHash })
		if (!auction.lastBid) {
			throw new Error("At least one bid does not exist")
		}
	})
}
