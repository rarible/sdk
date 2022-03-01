import type { FlowSdk } from "@rarible/flow-sdk"
import { retry } from "../../../../common/retry"

export async function awaitAuction(sdk: FlowSdk, auctionId: number) {
	return retry(10, 1000, async () => sdk.apis.auction.getAuctionById({ id: auctionId }))
}
