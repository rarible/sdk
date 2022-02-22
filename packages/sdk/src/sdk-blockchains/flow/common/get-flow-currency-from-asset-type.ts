import type { AssetType } from "@rarible/api-client"
import { getFungibleTokenName } from "./converters"

export function getFlowCurrencyFromAssetType(assetType: AssetType) {
	if (assetType["@type"] === "FLOW_FT") {
		return getFungibleTokenName(assetType.contract)
	}
	throw new Error("Invalid asset type")
}
