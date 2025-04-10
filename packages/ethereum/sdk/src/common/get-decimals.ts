import type { Ethereum } from "@rarible/ethereum-provider"
import type { AssetType } from "@rarible/ethereum-api-client"
import { createErc20Contract } from "../order/contracts/erc20"
import { isHederaEvm } from "./index"

export async function getDecimals(ethereum: Ethereum, assetType: AssetType): Promise<number> {
  switch (assetType.assetClass) {
    case "ETH":
      if (await isHederaEvm(ethereum)) {
        return 8
      }
      return 18
    case "ERC20":
      const decimals = await createErc20Contract(ethereum, assetType.contract).functionCall("decimals").call()
      return Number(decimals)
    default:
      throw new Error(`Asset type should be either ETH or ERC-20, received=${JSON.stringify(assetType)}`)
  }
}
