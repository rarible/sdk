import { Collection } from "@rarible/api-client"
import { UnionAddress } from "@rarible/types"
import { NftTokenId } from "@rarible/ethereum-api-client"

export type PrepareMintRequest = {
	tokenId?: NftTokenId
} & (HasCollection | HasCollectionId)

export type HasCollection = {
	collection: Collection
}

export type HasCollectionId = {
	collectionId: UnionAddress
}
