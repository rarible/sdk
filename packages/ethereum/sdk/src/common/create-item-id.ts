import type { Address, BigNumber, ItemId } from "@rarible/types"

export function createItemId(contract: Address, tokenId: BigNumber): ItemId {
	return `${contract}:${tokenId}` as ItemId
}
