import type { AmmNftAssetType, AssetType, CollectionAssetType, CryptoPunksAssetType, Erc1155AssetType, Erc1155LazyAssetType, Erc20AssetType, Erc721AssetType, Erc721LazyAssetType, EthAssetType, GenerativeArtAssetType } from "@rarible/ethereum-api-client"

export type AssetClass = AssetType["assetClass"]

export const assetClasses = [
	"ERC20",
	"ETH",
	"ERC721",
	"ERC1155",
	"ERC721_LAZY",
	"ERC1155_LAZY",
	"CRYPTO_PUNKS",
	"AMM_NFT",
	"COLLECTION",
	"GEN_ART",
] as AssetClass[]

export type AssetTypeByClass<T extends AssetClass> = {
	"ERC20": Erc20AssetType
	"ETH": EthAssetType
	"ERC721": Erc721AssetType
	"ERC1155": Erc1155AssetType
	"ERC721_LAZY": Erc721LazyAssetType
	"ERC1155_LAZY": Erc1155LazyAssetType
	"CRYPTO_PUNKS": CryptoPunksAssetType
	"AMM_NFT": AmmNftAssetType
	"COLLECTION": CollectionAssetType
	"GEN_ART": GenerativeArtAssetType
}[T]
