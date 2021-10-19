import { BigNumber } from "@rarible/types/build/big-number"
import { ItemId, Order, OrderPayout } from "@rarible/api-client"
import { AbstractPrepareResponse, CurrencyType, RequestCurrency } from "../../common/domain"

export type PrepareBidRequest = {
	itemId: ItemId
}

export type BidRequest = {
	/**
   * Currency of the trade
   */
	currency: RequestCurrency
	/**
   * Bid amount
   */
	amount: BigNumber
	/*
   * Price per nft
   */
	price: BigNumber
	/**
   * Origin fees, if not supported by the underlying contract, will throw Error
   */
	originFees?: OrderPayout[]
	/**
   * Payouts, if not supported by the underlying contract, will throw Error
   */
	payouts?: OrderPayout[]
}

export interface PrepareBidResponse extends AbstractPrepareResponse<"approve" | "sign", BidRequest, Order> {
	multiple: boolean
	/**
   * currencies supported by the blockchain
   */
	supportedCurrencies: CurrencyType[]
	/**
   * Max amount to sell (how many user owns and can sell). If 1, then input not needed
   */
	maxAmount: BigNumber
	/**
   * protocol base fee in basis points
   */
	baseFee: number
}

export type IBid = (request: PrepareBidRequest) => Promise<PrepareBidResponse>
