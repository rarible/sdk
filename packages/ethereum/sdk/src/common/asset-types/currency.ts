import type { AssetType, Erc20AssetType, EthAssetType } from "@rarible/ethereum-api-client"
import type { EthereumConfig } from "../../config/type"

export function isETHAssetType(asset: AssetType): asset is EthAssetType {
	return asset.assetClass === "ETH"
}

export function isErc20AssetType(asset: AssetType): asset is Erc20AssetType {
	return asset.assetClass === "ERC20"
}

export function isWethAssetType(asset: AssetType, config: EthereumConfig): asset is Erc20AssetType {
	return isErc20AssetType(asset) && asset.contract === config.weth
}

export function isPaymentAssetType(asset: AssetType): asset is Erc20AssetType | EthAssetType {
	switch (asset.assetClass) {
		case "ERC20": case "ETH":
			return true
		default:
			return false
	}
}
