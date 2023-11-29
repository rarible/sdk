import type { Asset, AssetType, EthOrderFormAsset } from "@rarible/api-client"

export function getAssetType(asset: Asset | EthOrderFormAsset): AssetType {
	if ("assetType" in asset) {
		return asset.assetType
	}
	if ("type" in asset) {
		return asset.type
	}
	throw new Error(`Expected "assetType" or "type" in asset, received=${JSON.stringify(asset)}`)
}
