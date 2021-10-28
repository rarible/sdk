import { ItemId, OrderPayout } from "@rarible/api-client"
import { BigNumberValue } from "@rarible/utils"
import { RequestCurrency } from "../../common/domain"

export type PrepareOrderRequest = {
	/**
	 * Item identifier to sell or bid
	 */
	itemId: ItemId
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
	originFees?: OrderPayout[]
	/**
	 * Payouts, if not supported by the underlying contract, will throw Error
	 */
	payouts?: OrderPayout[]
}

//todo how we should treat payouts, fees? basis points? or what
//todo what should we use for number in requests and responses? BigNumberValue?
