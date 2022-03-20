import type { CollectionId, ItemId, OrderId } from "@rarible/api-client"
import type { BigNumberValue } from "@rarible/utils"
import type { BigNumber } from "@rarible/types/build/big-number"
import type { UnionAddress } from "@rarible/types"
import type { AbstractPrepareResponse, CurrencyType, RequestCurrency } from "../../../common/domain"
import type { OriginFeeSupport, PayoutsSupport } from "../fill/domain"

export type PrepareOrderRequest = {
	/**
	 * Item identifier to sell or bid
	 */
	itemId: ItemId
}

export type PrepareOrderInternalRequest = {
	/**
	 * Collection id, where Item is from
	 */
	collectionId: CollectionId
}

export type UnionPart = {
	account: UnionAddress
	value: number
}

type BasePrepareOrderResponse<T> = AbstractPrepareResponse<"convert" | "approve" | "sign" | "send-tx", T, OrderId> & {
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
}

export type PrepareOrderInternalResponse = BasePrepareOrderResponse<OrderInternalRequest>

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

export type OrderUpdateRequest = {
	price: BigNumberValue
}
