import type { Asset, EthOrderFormAsset } from "@rarible/api-client"

export function convertAssetToEthForm(asset: Asset): EthOrderFormAsset {
	return {
		assetType: asset.type,
		value: asset.value,
	}
}
export function convertEthFormAssetToAsset(asset: EthOrderFormAsset): Asset {
	return {
		type: asset.assetType,
		value: asset.value,
	}
}
