import type { Ethereum } from "@rarible/ethereum-provider"
import type { AssetType } from "@rarible/ethereum-api-client"
import type { BigNumber, BigNumberValue } from "@rarible/utils"
import { toBn } from "@rarible/utils"
import { getDecimals } from "./get-decimals"

export async function getPrice(
  ethereum: Ethereum,
  assetType: AssetType,
  priceDecimal: BigNumberValue,
): Promise<BigNumber> {
  const decimals = await getDecimals(ethereum, assetType)
  switch (assetType.assetClass) {
    case "ETH":
      return toBn(priceDecimal).multipliedBy(toBn(10).pow(decimals))
    case "ERC20":
      return toBn(priceDecimal).multipliedBy(toBn(10).pow(Number(decimals)))
    default:
      throw new Error(`Asset type should be either ETH or ERC-20, received=${JSON.stringify(assetType)}`)
  }
}

export async function getPriceDecimal(
  ethereum: Ethereum,
  assetType: AssetType,
  price: BigNumberValue,
): Promise<BigNumber> {
  const decimals = await getDecimals(ethereum, assetType)
  const divider = toBn(10).pow(decimals)
  switch (assetType.assetClass) {
    case "ETH":
    case "ERC20":
      return toBn(price).div(divider)
    default:
      throw new Error(`Asset type should be either ETH or ERC-20, received=${JSON.stringify(assetType)}`)
  }
}
