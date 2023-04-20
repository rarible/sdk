import type { Erc1155AssetType, Erc721AssetType } from "@rarible/ethereum-api-client"
import type { NftAssetType } from "../order/check-asset-type"

export type TransferAsset = NftAssetType | Erc721AssetType | Erc1155AssetType
