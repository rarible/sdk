import type { ContractAddress, UnionAddress } from "@rarible/types"
import { Blockchain } from "@rarible/api-client"
import type { CollectionId, CurrencyId, ItemId, OrderId, OwnershipId } from "@rarible/api-client"

export function extractBlockchain(
	value: UnionAddress | ContractAddress | ItemId | OrderId | OwnershipId | CollectionId | CurrencyId,
): Blockchain {
	const idx = value.indexOf(":")
	if (idx === -1) {
		throw new Error(`Unable to extract blockchain from ${value}`)
	}
	const start = value.substring(0, idx)
	for (const blockchain of blockchains) {
		if (blockchain === start) {
			return blockchain
		}
	}
	throw new Error(`Unable to extract blockchain from ${value}`)
}

const blockchains: Blockchain[] = [
	Blockchain.ETHEREUM,
	Blockchain.FLOW,
	Blockchain.TEZOS,
	Blockchain.POLYGON,
	Blockchain.SOLANA,
	Blockchain.IMMUTABLEX,
]
