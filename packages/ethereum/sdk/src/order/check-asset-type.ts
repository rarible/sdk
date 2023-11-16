import type { BigNumber, ContractAddress } from "@rarible/types"
import { toBigNumber } from "@rarible/types"
import type {
	EthCollectionAssetType,
	EthCryptoPunksAssetType,
	EthErc1155AssetType,
	EthErc721AssetType,
	EthErc1155LazyAssetType,
	EthErc721LazyAssetType,
} from "@rarible/api-client"
import type { CollectionControllerApi } from "@rarible/api-client"

export type NftAssetType = {
	contract: ContractAddress
	tokenId: string | number | BigNumber
}

export type AssetTypeRequest =
  EthErc721AssetType | EthErc721LazyAssetType | EthErc1155AssetType | EthErc1155LazyAssetType
  | NftAssetType | EthCryptoPunksAssetType | EthCollectionAssetType

export type AssetTypeResponse =
  EthErc721AssetType | EthErc721LazyAssetType | EthErc1155AssetType | EthErc1155LazyAssetType
  | EthCryptoPunksAssetType | EthCollectionAssetType

export type CheckAssetTypeFunction = (asset: AssetTypeRequest) => Promise<AssetTypeResponse>

export async function checkAssetType(
	collectionApi: CollectionControllerApi, asset: AssetTypeRequest
): Promise<AssetTypeResponse> {
	if ("@type" in asset) {
		return asset
	} else {
		const collectionResponse = await collectionApi.getCollectionByIdRaw({ collection: asset.contract })
		if (collectionResponse.status === 200) {
			switch (collectionResponse.value.type) {
				case "ERC721":
				case "ERC1155": {
					return {
						...asset,
						tokenId: toBigNumber(`${asset.tokenId}`),
						"@type": collectionResponse.value.type,
					}
				}
				case "CRYPTO_PUNKS": {
					return {
						"@type": "CRYPTO_PUNKS",
						contract: asset.contract,
						tokenId: parseInt(`${asset.tokenId}`),
					}
				}
				default: {
					throw new Error(`Unrecognized collection asset class ${collectionResponse.value.type}`)
				}
			}
		} else {
			throw new Error(`Can't get info of NFT collection with id ${asset.contract}`)
		}
	}
}
