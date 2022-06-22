import type { ItemId, OrderId } from "@rarible/api-client"
import type { BigNumberValue } from "@rarible/utils"
import type { BigNumber } from "@rarible/types/build/big-number"
import type { UnionAddress } from "@rarible/types"
import type { AbstractPrepareResponse, CurrencyType, RequestCurrency } from "../../../common/domain"
import type { OriginFeeSupport, PayoutsSupport } from "../fill/domain"


/**
 * Item identifier to sell or bid
 * @property {ItemId} itemId - item id
 * @example
 * import { toItemId } from "@rarible/types"
 * const itemId = toItemId("ETHEREUM:0x395d7e3a4c0cc8fb8d19dcd0b010da43a7a98c9b:44188")
 */
export type PrepareOrderRequest = {
	/**
	 * Item identifier to sell or bid
	 */
	itemId: ItemId
}

/**
 * @property {UnionAddress} account account address with blockchain prefix "ETHEREUM:0x.."
 * @property {number} value base fee value in basis points 0...10000, where 0 = 0% and 10000 = 100%
 * @example
 * import { toUnionAddress } from "@rarible/types"
 * const part = [{
 * 	account: toUnionAddress("ETHEREUM:0x.."),
 * 	value: 500
 * }]
 */
export type UnionPart = {
	account: UnionAddress
	value: number
}

/**
 * @property {(request: OrderRequest) => OrderId} submit function for place an order
 * @property {CurrencyType[]} supportedCurrencies list of the supported currencies
 * @property {number} baseFee base fee value in basis points 0...10000
 * @property {OriginFeeSupport} originFeeSupport is support originFee
 * @property {PayoutsSupport} payoutsSupport is support payouts
 * @property {boolean} supportsExpirationDate is support expiration date
 */
export type BasePrepareOrderResponse<T> = AbstractPrepareResponse<"convert" | "approve" | "sign" | "send-tx", T, OrderId> & {
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
	/**
   * Whether the expiration date
   */
	supportsExpirationDate: boolean
}

export interface PrepareOrderResponse extends BasePrepareOrderResponse<OrderRequest> {
	/**
	 * Max amount to sell (how many user owns and can sell). If 1, then input not needed
	 */
	maxAmount: BigNumber | null
	/**
   * is multiple nft
   */
	multiple: boolean
}

export interface PrepareOrderInternalResponse extends BasePrepareOrderResponse<OrderInternalRequest> {
	/**
   * is multiple nft
   */
	multiple: boolean
}

/**
 * Request to create a sell-order or bid-order
 *
 * @property {number} amount amount to sell
 * @property {BigNumberValue} price sell price
 * @property {RequestCurrency} currency currency
 * @property {UnionPart[]} [originFees] origin fees
 * @property {UnionPart[]} [payouts] payouts
 * @property {Date} [expirationDate] order expiration date
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
	/**
	 * Order expiration date
	 */
	expirationDate?: Date
}

export type OrderInternalRequest = OrderRequest & {
	/**
	 * Id of Item to sell or bid
	 */
	itemId: ItemId
}

export interface PrepareOrderUpdateResponse extends AbstractPrepareResponse<"convert" | "approve" | "sign" | "send-tx", OrderUpdateRequest, OrderId> {
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
 * Order identifier to update sell or bid order
 */
export type PrepareOrderUpdateRequest = {
	orderId: OrderId
}

/**
 * Price BigNumberValue
 */
export type OrderUpdateRequest = {
	price: BigNumberValue
}
