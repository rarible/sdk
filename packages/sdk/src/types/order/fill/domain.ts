import type { ItemId, Order, OrderId } from "@rarible/api-client"
import type { BigNumber } from "@rarible/types/build/big-number"
import type { Blockchain } from "@rarible/api-client"
import type { IBlockchainTransaction } from "@rarible/sdk-transaction"
import type { Platform } from "@rarible/api-client/build/models/Platform"
import type { ContractAddress } from "@rarible/types"
import type { AbstractPrepareResponse } from "../../../common/domain"
import type { UnionPart } from "../common"

export type PrepareFillRequest = {
	/**
	 * Order identifier to fill
	 */
	orderId: OrderId
} | {
	/**
	 * Order to fill
	 */
	order: Order
}

export type PrepareFillInternalRequest = {
	order: Order
}

export enum OriginFeeSupport {
	NONE = "NONE",
	AMOUNT_ONLY = "AMOUNT_ONLY",
	FULL = "FULL",
}

export enum PayoutsSupport {
	NONE = "NONE",
	SINGLE = "SINGLE",
	MULTIPLE = "MULTIPLE",
}

export enum MaxFeesBasePointSupport {
	IGNORED = "IGNORED",
	REQUIRED = "REQUIRED",
}

export interface FillRequest {
	/**
	 * Number of NFTs to buy or to sell (in case of accepting bids)
	 */
	amount: number
	/**
	 * Origin fees, if not supported by the underlying contract, will throw Error
	 */
	originFees?: UnionPart[]
	/**
	 * Payouts, if not supported by the underlying contract, will throw Error
	 */
	payouts?: UnionPart[]
	/**
	 * Use infinite approvals (for ERC-20)
	 */
	infiniteApproval?: boolean
	/**
	 * ItemId for fill collection order
	 */
	itemId?: ItemId | ItemId[]
	/**
	 * Max fees value. Should be greater than 0. If required and not provided, will throw Error
	 */
	maxFeesBasePoint?: number,
	/**
   * Unwrap tokens on accept bid
   */
	unwrap?: boolean
	/**
   * Force pay royalties. It's working only on AMM orders
   */
	addRoyalties?: boolean
}

export type FillActionTypes = "approve" | "send-tx"

export interface PreparedFillInfo {
	/**
	 * is multiple nft
	 */
	multiple: boolean
	/**
	 * Maximum amount to fill (of NFTs)
	 * null is actual for orders with COLLECTION asset type
	 */
	maxAmount: BigNumber | null
	/**
	 * Base fee of the underlying exchange contract (this can not be changed)
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
	 * Whether the underlying exchange contract supports specifying max fees value
	 */
	maxFeesBasePointSupport: MaxFeesBasePointSupport
	/**
	 * Whether the underlying exchange contract supports partial fill
	 */
	supportsPartialFill: boolean
	/**
	 * Order data
	 */
	orderData?: {
		platform: Platform
		nftCollection: ContractAddress | undefined
	}
}

export interface PrepareFillResponse
	extends AbstractPrepareResponse<FillActionTypes, FillRequest, IBlockchainTransaction>, PreparedFillInfo {
}

/**
 * Fill sell/bid order
 *
 * @param request
 * @returns {Promise<PrepareFillResponse>}
 * @example ```
 * 		import { toOrderId, toBigNumber, toItemId } from "@rarible/types"
 * 		const buyAction = await sdk.order.buy({ orderId: toOrderId("ETHEREUM:0x...") })
 * 		const orderId = await buyAction.submit({
 *			  amount: 2, // Number of NFTs to buy or to sell (in case of accepting bids)
 *			  originFees?: [{account: toUnionAddress("ETHEREUM:0x...", value:  500)}], // Origin fees, if not supported by
 *			  // the underlying contract, will throw Error
 *			  payouts?: [{account: toUnionAddress("ETHEREUM:0x...", value:  500)}], // Payouts, if not supported by the
 *			  // underlying contract, will throw Error
 *			  infiniteApproval?: false, // Use infinite approvals (for ERC-20)
 *			  itemId?: toItemId("ETHEREUM:0x..."), // ItemId for fill collection order
 *			  unwrap?: false // unwrap tokens to accept bid
 *		})```
 */
export type IFillPrepare = (request: PrepareFillRequest) => Promise<PrepareFillResponse>

export interface IBatchBuyTransactionResult {
	type: "BATCH_BUY"
	results: {
		orderId: OrderId,
		result: boolean,
	}[]
}

export type BatchFillSingleRequest = { orderId: OrderId } & FillRequest
export type BatchFillRequest = BatchFillSingleRequest[]

type BatchSinglePrepared = { orderId: OrderId } & PreparedFillInfo

export interface PrepareBatchBuyResponse extends AbstractPrepareResponse<
FillActionTypes,
BatchFillRequest,
IBlockchainTransaction<Blockchain, IBatchBuyTransactionResult>
> {
	prepared: BatchSinglePrepared[]
}

export type IBatchBuyPrepare = (request: PrepareFillRequest[]) => Promise<PrepareBatchBuyResponse>
export type IBatchBuySimplified =
  (request: BatchFillRequest) => Promise<IBlockchainTransaction<Blockchain, IBatchBuyTransactionResult>>
