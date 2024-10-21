import type { NftCollectionControllerApi, NftTokenId } from "@rarible/ethereum-api-client"
import type { EVMAddress } from "@rarible/types"

export async function getTokenId(
  nftCollectionApi: NftCollectionControllerApi,
  collection: EVMAddress,
  minter: EVMAddress,
  nftTokenId?: NftTokenId,
) {
  if (nftTokenId !== undefined) {
    return nftTokenId
  }
  return await nftCollectionApi.generateNftTokenId({ collection, minter })
}
