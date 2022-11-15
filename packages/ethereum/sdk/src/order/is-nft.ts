import type {
	AssetType,
	Erc1155AssetType,
	Erc1155LazyAssetType,
	Erc721AssetType,
	Erc721LazyAssetType,
} from "@rarible/ethereum-api-client"

export function isNft(
	type: AssetType,
): type is (Erc721AssetType | Erc1155AssetType | Erc721LazyAssetType | Erc1155LazyAssetType) {
	switch (type.assetClass) {
		case "ERC721":
		case "ERC721_LAZY":
		case "ERC1155":
		case "ERC1155_LAZY":
		case "CRYPTO_PUNKS":
			return true
		default:
			return false
	}
}
