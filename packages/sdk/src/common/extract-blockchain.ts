import type { ContractAddress, UnionAddress } from "@rarible/types"
import { Blockchain } from "@rarible/api-client"
import type { CollectionId, CurrencyId, ItemId, OrderId, OwnershipId } from "@rarible/api-client"

const knownBlockchains = Object.values(Blockchain)
type BlockchainIsh = UnionAddress | ContractAddress | ItemId | OrderId | OwnershipId | CollectionId | CurrencyId

export function extractBlockchain(value: BlockchainIsh): Blockchain {
	const idx = value.indexOf(":")
	if (idx === -1) {
		throw new Error(`Unable to extract blockchain from ${value}`)
	}
	const start = value.substring(0, idx)
	for (const blockchain of knownBlockchains) {
		if (blockchain === start) {
			return blockchain
		}
	}
	throw new Error(`Unable to extract blockchain from ${value}`)
}


export function extractId(value: BlockchainIsh) {
	const idx = value.indexOf(":")
	if (idx === -1) throw new Error(`Unable to extract blockchain from ${value}`)
	return value.substring(idx + 1)
}

/**
 * @todo this must be implemented in `@rarible/types` package
 */

export function toBlockchainGroup(blockchain: Blockchain): Blockchain {
	switch (blockchain) {
		case Blockchain.ETHEREUM: case Blockchain.POLYGON: return Blockchain.ETHEREUM
		default: return blockchain
	}
}
