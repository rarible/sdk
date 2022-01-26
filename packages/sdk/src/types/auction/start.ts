import type { AuctionId } from "@rarible/api-client"
import type { ItemId } from "@rarible/api-client"
import type { BigNumberValue } from "@rarible/utils"
import type { PrepareOrderInternalRequest } from "../order/common"
import type { AbstractPrepareResponse, CurrencyType } from "../../common/domain"
import type { OriginFeeSupport, PayoutsSupport } from "../order/fill/domain"
import type { RequestCurrency } from "../../common/domain"
import type { UnionPart } from "../order/common"

export type IAuctionStart = (request: PrepareOrderInternalRequest) => Promise<PrepareStartAuctionResponse>

export type PrepareStartAuctionResponse = BasePrepareAuctionResponse<IStartAuctionRequest>

export type IStartAuctionRequest = {
	amount: number,
	currency: RequestCurrency,
	itemId: ItemId
	minimalStep: BigNumberValue,
	minimalPrice: BigNumberValue,
	duration: number,
	startTime?: number,
	buyOutPrice?: BigNumberValue,
	payouts: UnionPart[],
	originFees: UnionPart[],
}

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
