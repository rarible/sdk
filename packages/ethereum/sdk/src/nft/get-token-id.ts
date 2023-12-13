import type { Address, NftCollectionControllerApi, NftTokenId } from "@rarible/ethereum-api-client"

export async function getTokenId(
	nftCollectionApi: NftCollectionControllerApi, collection: Address, minter: Address, nftTokenId?: NftTokenId
) {
	if (nftTokenId !== undefined) {
		return nftTokenId
	}
	try {
	  return await nftCollectionApi.generateNftTokenId({ collection, minter })
	} catch (e) {
		console.log("e", e, collection, minter, nftTokenId)
		throw e
	}
}
