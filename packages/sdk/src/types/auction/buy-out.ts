import type { AuctionId } from "@rarible/api-client"
import type { IBlockchainTransaction } from "@rarible/sdk-transaction"
import type { UnionPart } from "../order/common"

export type IAuctionBuyOut = (auctionId: AuctionId, request: IBuyoutRequest) => Promise<IBlockchainTransaction>

export type IBuyoutRequest = {
	payouts: UnionPart[],
	originFees: UnionPart[],
}
