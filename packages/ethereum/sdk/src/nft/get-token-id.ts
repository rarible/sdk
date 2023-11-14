import type { Address, NftTokenId } from "@rarible/ethereum-api-client"
import type * as ApiClient from "@rarible/api-client"
import { wrapInRetry } from "../common/retry"

export async function getTokenId(
	nftCollectionApi: ApiClient.CollectionControllerApi, collection: Address, minter: Address, nftTokenId?: NftTokenId
) {
	if (nftTokenId !== undefined) {
		return nftTokenId
	}
	return wrapInRetry(() => nftCollectionApi.generateTokenId({ collection, minter }))
}
