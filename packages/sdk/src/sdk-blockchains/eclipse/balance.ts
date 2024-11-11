import type { Maybe, UnionAddress } from "@rarible/types"
import type { BigNumberValue } from "@rarible/utils"
import { toBn } from "@rarible/utils"
import type { SolanaWallet } from "@rarible/sdk-wallet"

import type { EclipseSdk } from "@rarible/eclipse-sdk"
import type * as ApiClient from "@rarible/api-client"
import { getCurrencyAssetType, getCurrencyId } from "../../common/get-currency-asset-type"
import type { RequestCurrency } from "../../common/domain"
import type { IApisSdk } from "../../domain"

export class EclipseBalance {
  constructor(
    readonly sdk: EclipseSdk,
    readonly wallet: Maybe<SolanaWallet>,
    private readonly apis: IApisSdk,
  ) {
    this.getBalance = this.getBalance.bind(this)
  }

  async getBalance(address: UnionAddress, currency: RequestCurrency): Promise<BigNumberValue> {
    const assetType = getCurrencyAssetType(currency)
    if (assetType["@type"] === "CURRENCY_NATIVE" && assetType.blockchain === "ECLIPSE") {
      const response = await this.apis.balances.getBalance({
        currencyId: getCurrencyId(currency as ApiClient.SolanaFtAssetType),
        owner: address,
      })
      return toBn(response.decimal)
    } else {
      throw new Error("Unsupported asset type")
    }
  }
}
