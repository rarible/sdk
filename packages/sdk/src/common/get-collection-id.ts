import { Blockchain } from "@rarible/api-client"
import type { CollectionId } from "@rarible/api-client"
import type { ContractAddress } from "@rarible/types"
import type { HasCollection, HasCollectionId } from "../types/nft/mint/prepare-mint-request.type"

export function getCollectionId(req: HasCollectionId | HasCollection): CollectionId {
	if ("collection" in req) {
		return req.collection.id
	}
	return req.collectionId
}

export function getBlockchainCollectionId(contract: ContractAddress | CollectionId): Blockchain {
	const [blockchain] = contract.split(":")
	if (!(blockchain in Blockchain)) {
		throw new Error(`Unrecognized blockchain in contract ${contract}`)
	}
	return blockchain as Blockchain
}
