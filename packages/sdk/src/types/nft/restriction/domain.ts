import type { ItemId, UnionAddress } from "@rarible/types"

export type CanTransferResult = {
	success: true
} | {
	success: false
	reason: string
}

export type IRestrictionSdk = {
	canTransfer: (
		itemId: ItemId, from: UnionAddress, to: UnionAddress,
	) => Promise<CanTransferResult>
}
