import type { Asset, AssetType } from "@rarible/api-client"
import type { EthOrderFormAsset } from "@rarible/api-client"

export type CheckLazyAsset<T = Asset | EthOrderFormAsset> = (asset: T) => Promise<T>
export async function checkLazyAsset<T extends Asset | EthOrderFormAsset>(
	checkLazyAssetType: (assetType: AssetType) => Promise<AssetType>,
	asset: T
): Promise<T> {
	if ("type" in asset) {
		return {
			type: await checkLazyAssetType(asset.type),
			value: asset.value,
		} as T
	} else if ("assetType" in asset) {
		return {
			assetType: await checkLazyAssetType(asset.assetType),
			value: asset.value,
		} as T
	}
	throw new Error("Unrecognized asset type")
}
