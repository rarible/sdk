import type {
	AssetType,
	EthErc1155AssetType,
	EthErc1155LazyAssetType,
	EthErc721AssetType,
	EthErc721LazyAssetType,
} from "@rarible/api-client"

export function isNft(
	type: AssetType,
): type is (EthErc721AssetType | EthErc1155AssetType | EthErc721LazyAssetType | EthErc1155LazyAssetType) {
	switch (type["@type"]) {
		case "ERC721":
		case "ERC721_Lazy":
		case "ERC1155":
		case "ERC1155_Lazy":
		case "CRYPTO_PUNKS":
			return true
		default:
			return false
	}
}
