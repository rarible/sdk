import type { AuctionId } from "@rarible/api-client"
import type { IBlockchainTransaction } from "@rarible/sdk-transaction"
import type { Action } from "@rarible/action"

export type IAuctionFinish = Action<"send-tx", FinishAuctionRequest, IBlockchainTransaction>

export type FinishAuctionRequest = {
	auctionId: AuctionId
}
