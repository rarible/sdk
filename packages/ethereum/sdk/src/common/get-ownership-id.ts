import type { Address, BigNumber } from "@rarible/ethereum-api-client"

export function getOwnershipId(contract: Address, tokenId: BigNumber, owner: Address): string {
	return `${contract}:${tokenId}:${owner}`
}
