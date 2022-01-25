import type { AuctionId } from "@rarible/api-client"
import type { IBlockchainTransaction } from "@rarible/sdk-transaction"
import type BigNumber from "bignumber.js"
import type { UnionPart } from "../order/common"

export type IAuctionPutBid = (auctionId: AuctionId, request: IPutBidRequest) => Promise<IBlockchainTransaction>

export type IPutBidRequest = {
	price: BigNumber,
	payouts: UnionPart[],
	originFees: UnionPart[],
}
