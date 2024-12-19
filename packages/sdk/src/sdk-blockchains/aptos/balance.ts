import type { AptosSdk } from "@rarible/aptos-sdk"
import type { UnionAddress } from "@rarible/types"
import type { BigNumber } from "@rarible/utils"
import { toBn } from "@rarible/utils"
import { extractId } from "@rarible/sdk-common"
import { getCurrencyAssetType } from "../../common/get-currency-asset-type"
import type { RequestCurrency } from "../../common/domain"
import type { IApisSdk } from "../../domain"

export class AptosBalance {
  constructor(
    private readonly sdk: AptosSdk,
    private readonly apis: IApisSdk,
  ) {
    this.getBalance = this.getBalance.bind(this)
  }

  async getBalance(address: UnionAddress, currency: RequestCurrency): Promise<BigNumber> {
    const assetType = getCurrencyAssetType(currency)
    const aptosAddress = extractId(address)

    if (assetType["@type"] === "CURRENCY_NATIVE") {
      const balance = await this.sdk.balance.getAptosBalance({ address: aptosAddress })
      return toBn(balance)
    }
    throw new Error("Unsupported asset type")
  }
}
