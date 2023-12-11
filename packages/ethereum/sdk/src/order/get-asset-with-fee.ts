import type { EthOrderFormAsset } from "@rarible/api-client/build/models/EthOrderFormAsset"
import type { Asset } from "@rarible/api-client"
import { addFee } from "./add-fee"

export function getAssetWithFee<T extends Asset | EthOrderFormAsset>(asset: T, fee: number) {
	const assetType = getAssetType(asset)
	if (assetType["@type"] === "ETH" || assetType["@type"] === "ERC20") {
		return addFee(asset, fee)
	} else {
		return asset
	}
}

function getAssetType<T extends Asset | EthOrderFormAsset>(asset: T) {
	if ("type" in asset) {
		return asset.type
	} else if ("assetType" in asset) {
		return asset.assetType
	}
	throw new Error(`Asset type has not been found in object ${JSON.stringify(asset)}`)
}
