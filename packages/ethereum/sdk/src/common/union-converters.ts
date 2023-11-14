import type { Address, BigNumber, ItemId, UnionAddress } from "@rarible/types"
import { toItemId } from "@rarible/types/build/item-id"
import { toOwnershipId, toUnionAddress } from "@rarible/types"
import type { Royalty } from "@rarible/api-client/build/models/Royalty"
import { convertToEVMAddress } from "@rarible/sdk-common"
import { getUnionBlockchainFromChainId } from "./get-blockchain-from-chain-id"

export function createUnionItemId(chainId: number, contract: Address, tokenId: number | string | BigNumber): ItemId {
	return toItemId(`${getUnionBlockchainFromChainId(chainId)}:${contract}:${tokenId}`)
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

export function convertUnionRoyaltiesToEVM(royalties: Royalty[]) {
	return royalties.map(royalty => ({
		value: royalty.value,
		account: royalty.account,
	}))
}

export function convertUnionRoyalties(royalty: Royalty): { value: number, account: Address } {
	return {
		value: royalty.value,
		account: convertToEVMAddress(royalty.account),
	}
}
