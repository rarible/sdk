import type { Asset, AssetType } from "@rarible/api-client"

export async function checkLazyAsset(
	checkLazyAssetType: (assetType: AssetType) => Promise<AssetType>,
	asset: Asset
): Promise<Asset> {
	return {
		type: await checkLazyAssetType(asset.type),
		value: asset.value,
	}
}
