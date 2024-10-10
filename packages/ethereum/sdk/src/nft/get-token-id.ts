import type { EVMAddress, NftCollectionControllerApi, NftTokenId } from "@rarible/ethereum-api-client"
import type { Address } from "@rarible/types"
import { wrapInRetry } from "../common/retry"

export async function getTokenId(
  nftCollectionApi: NftCollectionControllerApi,
  collection: EVMAddress | Address,
  minter: Address | EVMAddress,
  nftTokenId?: NftTokenId,
) {
  if (nftTokenId !== undefined) {
    return nftTokenId
  }
  return wrapInRetry(() => nftCollectionApi.generateNftTokenId({ collection, minter }))
}
