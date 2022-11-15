import type { Asset } from "@rarible/ethereum-api-client"
import { addFee } from "./add-fee"

export function getAssetWithFee(asset: Asset, fee: number) {
	if (asset.assetType.assetClass === "ETH" || asset.assetType.assetClass === "ERC20") {
		return addFee(asset, fee)
	} else {
		return asset
	}
}
