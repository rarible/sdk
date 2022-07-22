import type { ItemId, UnionAddress } from "@rarible/types"

export type CanTransferResult = {
	success: true
} | {
	success: false
	reason: string
}

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
}
