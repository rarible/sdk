import type { AssetType, AuctionId } from "@rarible/api-client"
import type BigNumber from "bignumber.js"
import type { BigNumberValue } from "@rarible/utils"
import type { IBlockchainTransaction } from "@rarible/sdk-transaction"
import type { ItemId } from "@rarible/api-client"
import type { UnionPart } from "../order/common"
import type { PrepareOrderRequest } from "../order/common"
import type { AbstractPrepareResponse, CurrencyType } from "../../common/domain"
import type { OriginFeeSupport, PayoutsSupport } from "../order/fill/domain"
import type { RequestCurrency } from "../../common/domain"
import type { PrepareOrderInternalRequest } from "../order/common"

export type IStartAuctionRequest = {
	amount: number,
	currency: RequestCurrency,
	itemId: ItemId
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
	start(request: PrepareOrderInternalRequest): Promise<PrepareAuctionResponse>
	cancel(auctionId: AuctionId): Promise<IBlockchainTransaction>
	finish(auctionId: AuctionId): Promise<IBlockchainTransaction>
	putBid(auctionId: AuctionId, request: IPutBidRequest): Promise<IBlockchainTransaction>
	buyOut(auctionId: AuctionId, request: IBuyoutRequest): Promise<IBlockchainTransaction>
}

export type PrepareAuctionResponse = BasePrepareAuctionResponse<IStartAuctionRequest>

export type BasePrepareAuctionResponse<T> = AbstractPrepareResponse<"approve" | "sign" | "send-tx", T, AuctionId> & {
	/**
   * is multiple nft
   */
	multiple: boolean
	/**
   * currencies supported by the blockchain
   */
	supportedCurrencies: CurrencyType[]
	/**
   * protocol base fee in basis points
   */
	baseFee: number
	/**
   * Whether the underlying exchange contract supports origin fees
   */
	originFeeSupport: OriginFeeSupport
	/**
   * Whether the underlying exchange contract supports specifying payouts
   */
	payoutsSupport: PayoutsSupport
}

/**
 * Request to create a sell-order or bid-order
 */
export type OrderRequest = {
	/**
   * How many NFTs to sell or create bid for
   */
	amount: number
	/**
   * Price per one NFT
   */
	price: BigNumberValue
	/**
   * Currency of the trade
   */
	currency: RequestCurrency
	/**
   * Origin fees, if not supported by the underlying contract, will throw Error
   */
	originFees?: UnionPart[]
	/**
   * Payouts, if not supported by the underlying contract, will throw Error
   */
	payouts?: UnionPart[]
}

export type OrderInternalRequest = OrderRequest & {
	/**
   * Id of Item to sell or bid
   */
	itemId: ItemId
}
