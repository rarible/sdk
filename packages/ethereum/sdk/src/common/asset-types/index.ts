import type { Erc20AssetType, EthAssetType, EVMAddress } from "@rarible/ethereum-api-client"

export const getEthAssetType = (): EthAssetType => ({
  assetClass: "ETH",
})

export const getErc20AssetType = (contract: EVMAddress): Erc20AssetType => ({
  assetClass: "ERC20",
  contract,
})
