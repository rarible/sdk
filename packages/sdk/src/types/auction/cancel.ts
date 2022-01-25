import type { AuctionId } from "@rarible/api-client"
import type { IBlockchainTransaction } from "@rarible/sdk-transaction"
import type { Action } from "@rarible/action"
import { IPutBidRequest } from "./put-bid"

export type IAuctionCancel = Action<"send-tx", CancelAuctionRequest, IBlockchainTransaction>

export type CancelAuctionRequest = {
	auctionId: AuctionId
}
