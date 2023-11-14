import type { EthOrderFormAsset } from "@rarible/api-client/build/models/EthOrderFormAsset"
import { addFee } from "./add-fee"

export function getAssetWithFee(asset: EthOrderFormAsset, fee: number) {
	if (asset.assetType["@type"] === "ETH" || asset.assetType["@type"] === "ERC20") {
		return addFee(asset, fee)
	} else {
		return asset
	}
}
