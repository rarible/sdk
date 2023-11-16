import type { Address, BigNumber } from "@rarible/types"
export function createItemId(contract: Address, tokenId: BigNumber): string {
	return `${contract}:${tokenId}`
}
