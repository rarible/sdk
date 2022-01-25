import type { AuctionId } from "@rarible/api-client"
import type { IRaribleSdk } from "../../../domain"
import { retry } from "../../../common/retry"

export async function awaitAuction(sdk: IRaribleSdk, auctionId: AuctionId) {
	return retry(5, 2000, () => sdk.apis.auction.getAuctionById({ id: auctionId }))
}
