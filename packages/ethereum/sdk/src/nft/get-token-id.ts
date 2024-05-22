import type { Address, NftCollectionControllerApi, NftTokenId } from "@rarible/ethereum-api-client"
import { wrapInRetry } from "../common/retry"

export async function getTokenId(
  nftCollectionApi: NftCollectionControllerApi,
  collection: Address,
  minter: Address,
  nftTokenId?: NftTokenId,
) {
  if (nftTokenId !== undefined) {
    return nftTokenId
  }
  return wrapInRetry(() => nftCollectionApi.generateNftTokenId({ collection, minter }))
}
