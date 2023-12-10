import type { Address, BigNumber, ItemId, UnionAddress } from "@rarible/types"
import { toItemId } from "@rarible/types/build/item-id"
import { toOwnershipId, toUnionAddress } from "@rarible/types"
import type { Royalty } from "@rarible/api-client/build/models/Royalty"
import { convertToEVMAddress } from "@rarible/sdk-common"
import type { Creator } from "@rarible/api-client/build/models/Creator"
import type { CollectionId } from "@rarible/api-client"
import type { Payout } from "@rarible/api-client/build/models/Payout"
import { getUnionBlockchainFromChainId } from "./get-blockchain-from-chain-id"

export function createUnionItemId(chainId: number, contract: Address, tokenId: number | string | BigNumber): ItemId {
	return toItemId(`${getUnionBlockchainFromChainId(chainId)}:${contract}:${tokenId}`)
}

export function createUnionItemIdWithCollectionId(collectionId: CollectionId, tokenId: number | string | BigNumber): ItemId {
	return toItemId(`${collectionId}:${tokenId}`)
}

export function createUnionAddressWithChainId(chainId: number, address: string): UnionAddress {
	return toUnionAddress(`${getUnionBlockchainFromChainId(chainId)}:${address}`)
}

export function createUnionAddress(address: Address): UnionAddress {
	return toUnionAddress(address)
}

export function createUnionOwnership(
	chainId: number,
	contract: Address,
	tokenId: number | string | BigNumber,
	owner: Address
) {
	return toOwnershipId(`${getUnionBlockchainFromChainId(chainId)}:${contract}:${tokenId}:${owner}`)
}

export function convertUnionPartsToEVM(
	royalties?: Royalty[] | Creator[] | Payout[]
): Array<{ account: Address, value: number }> {
	return royalties?.map(royalty => ({
		value: royalty.value,
		account: convertToEVMAddress(royalty.account),
	})) || []
}

export function convertUnionRoyalties(royalty: Royalty): { value: number, account: Address } {
	return {
		value: royalty.value,
		account: convertToEVMAddress(royalty.account),
	}
}
