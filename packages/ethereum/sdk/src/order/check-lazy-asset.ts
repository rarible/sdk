import type { Asset, AssetType } from "@rarible/ethereum-api-client"

export async function checkLazyAsset(
	checkLazyAssetType: (assetType: AssetType) => Promise<AssetType>,
	asset: Asset
): Promise<Asset> {
	return {
		assetType: await checkLazyAssetType(asset.assetType),
		value: asset.value,
	}
}
