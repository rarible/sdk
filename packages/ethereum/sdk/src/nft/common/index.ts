import type { Address, AssetType, Erc20AssetType, Erc721AssetType, EthAssetType } from "@rarible/ethereum-api-client"

export function isETH(asset: AssetType): asset is EthAssetType {
	return asset.assetClass === "ETH"
}

export function isErc20(asset: AssetType): asset is Erc20AssetType {
	return asset.assetClass === "ERC20"
}

export function isErc721(asset: AssetType): asset is Erc721AssetType {
	return asset.assetClass === "ERC721"
}

export function isErc1155(asset: AssetType): asset is Erc721AssetType {
	return asset.assetClass === "ERC1155"
}

export function isWeth(asset: AssetType, weth: Address): boolean {
	return isErc20(asset) && asset.contract === weth
}
