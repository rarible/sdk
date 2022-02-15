import type { AuctionId } from "@rarible/api-client"
import type { IRaribleSdk } from "../../../domain"
import { retry } from "../../../common/retry"

export async function awaitForAuctionBid(sdk: IRaribleSdk, auctionId: AuctionId) {
	return retry(5, 2000, async () => {
		const auction = await sdk.apis.auction.getAuctionById({ id: auctionId })
		if (!auction.lastBid) {
			throw new Error("At least one bid does not exist")
		}
	})
}
