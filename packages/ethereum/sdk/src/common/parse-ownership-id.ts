import { toAddress } from "@rarible/types"

export function parseOwnershipId(ownershipId: string) {
	const split = ownershipId.split(":")
	if (split.length < 3) {
		throw new Error(`Unable to parse OwnershipId: ${ownershipId}`)
	}
	const [contract, tokenId, owner] = split
	return { contract: toAddress(contract), tokenId, owner: toAddress(owner) }
}
