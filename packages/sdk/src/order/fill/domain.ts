import { Order, OrderId } from "@rarible/api-client"
import { BigNumber } from "@rarible/types/build/big-number"
import { EthOrderPayout } from "@rarible/api-client/build/models/EthOrderPayout"
import { IBlockchainTransaction } from "@rarible/sdk-transaction/src/domain"
import { AbstractPrepareResponse } from "../../common/domain"

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
	originFees?: EthOrderPayout[]
	/**
	 * Payouts, if not supported by the underlying contract, will throw Error
	 */
	payouts?: EthOrderPayout[]
	/**
	 * Use infinite approvals (for ERC-20)
	 */
	infiniteApproval?: boolean
}

export interface PrepareFillResponse extends AbstractPrepareResponse<"approve" | "send-tx", FillRequest, IBlockchainTransaction> {
	/**
	 * Maximum amount to fill (of NFTs)
	 */
	maxAmount: BigNumber
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

export type IFill = (request: PrepareFillRequest) => Promise<PrepareFillResponse>
