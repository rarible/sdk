import type { AssetType, Erc1155AssetType, Erc1155LazyAssetType, Erc721AssetType, Erc721LazyAssetType, CryptoPunksAssetType } from "@rarible/ethereum-api-client"

export type NftAssetKnownType =
	| Erc721AssetType
	| Erc1155AssetType
	| Erc721LazyAssetType
	| Erc1155LazyAssetType
	| CryptoPunksAssetType

export function isNftAssetType(type: AssetType): type is NftAssetKnownType {
	switch (type.assetClass) {
		case "ERC721": case "ERC721_LAZY": case "ERC1155": case "ERC1155_LAZY": case "CRYPTO_PUNKS":
			return true
		default:
			return false
	}
}

export function isErc721AssetType(asset: AssetType): asset is Erc721AssetType {
	return asset.assetClass === "ERC721"
}

export function isErc1155AssetType(asset: AssetType): asset is Erc721AssetType {
	return asset.assetClass === "ERC1155"
}