import type { Collection } from "@rarible/api-client"
import type { UnionAddress } from "@rarible/types"
import type { NftTokenId } from "@rarible/ethereum-api-client"

export type PrepareMintRequest = {
	tokenId?: NftTokenId
} & (HasCollection | HasCollectionId)

export type HasCollection = {
	collection: Collection
}

export type HasCollectionId = {
	collectionId: UnionAddress
}
