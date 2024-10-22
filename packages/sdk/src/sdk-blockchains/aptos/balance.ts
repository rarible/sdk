import type { AptosSdk } from "@rarible/aptos-sdk"
import type { UnionAddress } from "@rarible/types"
import type { BigNumber } from "@rarible/utils"
import { toBn } from "@rarible/utils"
import { getCurrencyId } from "../../common/get-currency-asset-type"
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
    const response = await this.apis.balances.getBalance({
      currencyId: getCurrencyId(currency),
      owner: address,
    })
    return toBn(response.decimal)
  }
}
