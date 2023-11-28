import type {
	CollectionControllerApi,
	CollectionId,
	EthCollectionTokenId,
	UnionAddress,
} from "@rarible/api-client"
import { wrapInRetry } from "../common/retry"

export async function getTokenId(
	nftCollectionApi: CollectionControllerApi,
	collection: CollectionId,
	minter: UnionAddress,
	nftTokenId?: EthCollectionTokenId
): Promise<EthCollectionTokenId> {
	if (nftTokenId !== undefined) {
		return nftTokenId
	}
	return wrapInRetry(
		() => nftCollectionApi.generateTokenId({ collection, minter }) as Promise<EthCollectionTokenId>
	)
}
