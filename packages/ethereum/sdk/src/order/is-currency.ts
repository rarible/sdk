import type { AssetType, EthErc20AssetType, EthEthereumAssetType } from "@rarible/api-client"

export function isCurrency(
	type: AssetType,
): type is (EthErc20AssetType | EthEthereumAssetType) {
	switch (type["@type"]) {
		case "ERC20":
			return true
		case "ETH":
			return true
		default:
			return false
	}
}
