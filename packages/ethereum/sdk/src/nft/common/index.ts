import type {
	AssetType,
	EthErc20AssetType,
	EthErc1155AssetType,
	EthErc721AssetType,
} from "@rarible/api-client"
import type { EthEthereumAssetType } from "@rarible/api-client/build/models/AssetType"
import type { EthereumConfig } from "../../config/type"


export function isETH(asset: AssetType): asset is EthEthereumAssetType {
	return asset["@type"] === "ETH"
}

export function isErc20(asset: AssetType): asset is EthErc20AssetType {
	return asset["@type"] === "ERC20"
}

export function isErc721(asset: AssetType): asset is EthErc721AssetType {
	return asset["@type"] === "ERC721"
}

export function isErc1155(asset: AssetType): asset is EthErc1155AssetType {
	return asset["@type"] === "ERC1155"
}

export function isWeth(asset: AssetType, config: EthereumConfig): boolean {
	return isErc20(asset) && asset.contract === config.weth
}

export function isRari(asset: AssetType, config: EthereumConfig): boolean {
	return isErc20(asset) && asset.contract === config.rari
}
