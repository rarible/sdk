import type { Address, Erc20AssetType, EthAssetType } from "@rarible/ethereum-api-client"

export const getEthAssetType = (): EthAssetType => ({
	assetClass: "ETH",
})

export const getErc20AssetType = (contract: Address): Erc20AssetType => ({
	assetClass: "ERC20",
	contract,
})
