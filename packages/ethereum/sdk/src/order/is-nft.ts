import type {
  AssetType,
  Erc1155AssetType,
  Erc1155LazyAssetType,
  Erc721AssetType,
  Erc721LazyAssetType,
  CryptoPunksAssetType,
} from "@rarible/ethereum-api-client"

export type NftAssetKnownType =
  | Erc721AssetType
  | Erc1155AssetType
  | Erc721LazyAssetType
  | Erc1155LazyAssetType
  | CryptoPunksAssetType

export function isNft(type: AssetType): type is NftAssetKnownType {
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
