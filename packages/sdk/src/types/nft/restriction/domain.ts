import type { ItemId, UnionAddress } from "@rarible/types"
import type { OriginFeeSupport } from "../../order/fill/domain"

export type IRestrictionSdk = {
	/**
	 *
	 * @param itemId - Item id
	 * @param from - Sender address
	 * @param to - Recipient
	 * @returns {Promise<CanTransferResult>} - { success: true } | { success: false, reason: string }
	 */
	canTransfer: (
		itemId: ItemId, from: UnionAddress, to: UnionAddress,
	) => Promise<CanTransferResult>

	getFutureOrderFees: (
		itemId: ItemId
	) => Promise<GetFutureOrderFeeData>
}

export type CanTransferResult = {
	success: true
} | {
	success: false
	reason: string
}

export type GetFutureOrderFeeData = {
	originFeeSupport: OriginFeeSupport
	baseFee: number
}
