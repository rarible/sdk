import { ItemId, OrderId } from "@rarible/api-client"
import { BigNumberValue } from "@rarible/utils"
import { BigNumber } from "@rarible/types/build/big-number"
import { UnionAddress } from "@rarible/types"
import { AbstractPrepareResponse, CurrencyType, RequestCurrency } from "../../common/domain"

export type PrepareOrderRequest = {
	/**
	 * Item identifier to sell or bid
	 */
	itemId: ItemId
}

export type UnionPart = {
	account: UnionAddress
	value: number
}

export interface PrepareOrderResponse extends AbstractPrepareResponse<"approve" | "sign" | "send-tx", OrderRequest, OrderId> {
	/**
	 * is multiple nft
	 */
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
