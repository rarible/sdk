import type { AuctionId } from "@rarible/api-client"
import type { IBlockchainTransaction } from "@rarible/sdk-transaction"
import type { Action } from "@rarible/action"
import type { UnionPart } from "../order/common"

export type IAuctionBuyOut = Action<"approve" | "sign", IBuyoutRequest, IBlockchainTransaction>

export type IBuyoutRequest = {
	auctionId: AuctionId
	originFees?: UnionPart[],
}
