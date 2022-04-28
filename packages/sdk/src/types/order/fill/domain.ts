import type { ItemId, Order, OrderId } from "@rarible/api-client"
import type { BigNumber } from "@rarible/types/build/big-number"
import type { IBlockchainTransaction } from "@rarible/sdk-transaction"
import type {
	OpenSeaV1OrderFillRequest,
	RaribleV2OrderFillRequest,
} from "@rarible/protocol-ethereum-sdk/build/order/fill-order/types"
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
	itemId?: ItemId
	/*
  * Unwrap tokens on accept bid
   */
	unwrap?: boolean
}

export type FillActionTypes = "approve" | "send-tx"

interface CommonFillResponse {
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
	 * Whether the underlying exchange contract supports partial fill
	 */
	supportsPartialFill: boolean
}

export type PrepareFillResponse =
	AbstractPrepareResponse<FillActionTypes, FillRequest, IBlockchainTransaction> & CommonFillResponse

export type IFill = (request: PrepareFillRequest) => Promise<PrepareFillResponse>

export interface PrepareBulkFillResponse
	extends AbstractPrepareResponse<FillActionTypes, FillRequest[], IBlockchainTransaction> {
	preparedFillResponse: CommonFillResponse[]
}

export type FillOrderBulkRequest = RaribleV2OrderFillRequest | OpenSeaV1OrderFillRequest

export type IFillBulk = (request: PrepareFillRequest[]) => Promise<PrepareBulkFillResponse>
