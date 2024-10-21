import type { UnionAddress } from "@rarible/types"
import type { BigNumberValue } from "@rarible/utils"
import type { SolanaWallet } from "@rarible/sdk-wallet"
import type { Maybe } from "@rarible/types/build/maybe"

import type { EclipseSdk } from "@rarible/eclipse-sdk"
import { getCurrencyAssetType } from "../../common/get-currency-asset-type"
import type { RequestCurrency } from "../../common/domain"
import { extractPublicKey } from "../solana/common/address-converters"

export class EclipseBalance {
  constructor(
    readonly sdk: EclipseSdk,
    readonly wallet: Maybe<SolanaWallet>,
  ) {
    this.getBalance = this.getBalance.bind(this)
  }

  async getBalance(address: UnionAddress, currency: RequestCurrency): Promise<BigNumberValue> {
    const assetType = getCurrencyAssetType(currency)
    if (assetType["@type"] === "CURRENCY_NATIVE" && assetType.blockchain === "ECLIPSE") {
      return await this.sdk.balances.getBalance(extractPublicKey(address), { commitment: "max" })
    } else {
      throw new Error("Unsupported asset type")
    }
  }
}
