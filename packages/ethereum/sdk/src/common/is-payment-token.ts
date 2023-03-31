import type { AssetType } from "@rarible/ethereum-api-client"

export function isPaymentToken(assetType: AssetType): boolean {
	switch (assetType.assetClass) {
		case "ETH":
		case "ERC20":
			return true
		default: return false
	}
}
