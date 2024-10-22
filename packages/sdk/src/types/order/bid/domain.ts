import type { AssetType, CollectionId, CurrencyId } from "@rarible/api-client"
import type { BigNumberValue } from "@rarible/utils"
import type {
  PrepareOrderRequest,
  PrepareOrderResponse,
  PrepareOrderUpdateRequest,
  PrepareOrderUpdateResponse,
  UnionPart,
} from "../common"

export type PrepareBidResponse = PrepareOrderResponse &
  GetConvertableValueFunction & {
    /**
     * Whether bid funds should be transferred during operation
     */
    shouldTransferFunds: boolean
  }

export type PrepareBidUpdateResponse = PrepareOrderUpdateResponse & GetConvertableValueFunction

export type GetConvertableValueFunction = {
  getConvertableValue(request: GetConvertableValueRequest): Promise<GetConvertableValueResult>
}

export type GetConvertableValueRequest = {
  assetType?: AssetType
  currencyId?: CurrencyId
  price: BigNumberValue
  amount: number
  originFees: UnionPart[]
}

export type GetConvertableValueResult =
  | {
      type: "insufficient" | "convertable"
      currency: AssetType
      value: BigNumberValue
    }
  | undefined

/**
 * Create bid order
 * @param request itemId or collectionId
 * @returns {Promise<PrepareBidResponse>}
 * @example
 * import { toItemId } from "@rarible/types"
 * const bidAction = sdk.order.bid({itemId: toItemId("ETHEREUM:0x...")})
 * const { orderId } = bidAction.submit({
 * 		amount: number //How many NFTs to sell or create bid for
 * 		price: BigNumberValue // Price per one NFT
 * 		currency: RequestCurrency //Currency of the trade
 * 		originFees?: UnionPart[] //Origin fees, if not supported by the underlying contract, will throw Error
 * 		payouts?: UnionPart[] //Payouts, if not supported by the underlying contract, will throw Error
 * 		expirationDate?: Date // Order expiration date
 * })
 */
export type IBidPrepare = (request: PrepareBidRequest) => Promise<PrepareBidResponse>
/**
 * Update bid order
 * @param request bid "orderId" for update
 * @returns {Promise<PrepareBidUpdateResponse>}
 * @example
 * const updateAction = await sdk2.order.bidUpdate({
 *		orderId,
 * })
 * const orderId = await updateAction.submit({ price: "0.0000000000000004" })
 */
export type IBidUpdatePrepare = (request: PrepareOrderUpdateRequest) => Promise<PrepareBidUpdateResponse>

/**
 * @typedef {import("@rarible/types").ItemId} ItemId
 */
/**
 * \{itemid: {@link ItemId}\} or \{collection: {@link CollectionId}\}
 */
export type PrepareBidRequest = PrepareOrderRequest | { collectionId: CollectionId }

export type ConvertCurrencyRequest = {
  price: BigNumberValue
}
