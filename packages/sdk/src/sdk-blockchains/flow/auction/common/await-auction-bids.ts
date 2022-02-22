import type { FlowSdk } from "@rarible/flow-sdk"
import { retry } from "../../../../common/retry"

export async function awaitAuctionBids(sdk: FlowSdk, auctionId: number) {
	return retry(10, 1000, async () => sdk.apis.auction.getAuctionBidsById({ id: auctionId }))
}
