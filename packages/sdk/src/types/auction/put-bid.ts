import type { AuctionId } from "@rarible/api-client"
import type { IBlockchainTransaction } from "@rarible/sdk-transaction"
import type BigNumber from "bignumber.js"
import type { Action } from "@rarible/action"
import type { UnionPart } from "../order/common"

export type IAuctionPutBid = Action<"approve" | "sign", IPutBidRequest, IBlockchainTransaction>

export type IPutBidRequest = {
	auctionId: AuctionId
	price: BigNumber
	payouts: UnionPart[]
	originFees: UnionPart[]
}
