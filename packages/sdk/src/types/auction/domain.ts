import type { AssetType, AuctionId } from "@rarible/api-client"
import type BigNumber from "bignumber.js"
import type { BigNumberValue } from "@rarible/utils"
import type { IBlockchainTransaction } from "@rarible/sdk-transaction"
import type { UnionPart } from "../order/common"

export type IStartAuctionRequest = {
	makeAssetType: AssetType,
	amount: BigNumber,
	takeAssetType: AssetType,
	minimalStep: BigNumberValue,
	minimalPrice: BigNumberValue,
	duration: number,
	startTime?: number,
	buyOutPrice: BigNumberValue,
	payouts: UnionPart[],
	originFees: UnionPart[],
}

export type IPutBidRequest = {
	price: BigNumber,
	payouts: UnionPart[],
	originFees: UnionPart[],
}

export type IBuyoutRequest = {
	payouts: UnionPart[],
	originFees: UnionPart[],
}

export interface IAuctionSdk {
	start(request: IStartAuctionRequest): Promise<IBlockchainTransaction>
	cancel(auctionId: AuctionId): Promise<IBlockchainTransaction>
	finish(auctionId: AuctionId): Promise<IBlockchainTransaction>
	putBid(auctionId: AuctionId, request: IPutBidRequest): Promise<IBlockchainTransaction>
	buyOut(auctionId: AuctionId, request: IBuyoutRequest): Promise<IBlockchainTransaction>
}
