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
	 * @param {ItemId} itemId - Item id
	 * @param {UnionAddress} from - Sender address
	 * @param {UnionAddress} to - Recipient
	 * @returns {Promise<CanTransferResult>} - { success: true } | { success: false, reason: string }
	 */
	canTransfer: (
		itemId: ItemId, from: UnionAddress, to: UnionAddress,
	) => Promise<CanTransferResult>
}
