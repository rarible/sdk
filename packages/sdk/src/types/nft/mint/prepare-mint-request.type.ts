import type { Collection, ContractAddress } from "@rarible/api-client"
import type { TokenId } from "../generate-token-id"

export type PrepareMintRequest = {
	tokenId?: TokenId
} & (HasCollection | HasCollectionId)

export type HasCollection = {
	collection: Collection
}

export type HasCollectionId = {
	collectionId: ContractAddress
}
