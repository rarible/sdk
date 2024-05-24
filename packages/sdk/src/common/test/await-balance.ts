import type { IRaribleSdk } from "@rarible/sdk"
import type { UnionAddress } from "@rarible/types"
import type { RequestCurrency } from "@rarible/sdk"
import type { BigNumberValue } from "@rarible/utils"
import { waitFor } from "../wait-for"

export async function awaitBalance(
  sdk: IRaribleSdk,
  address: UnionAddress,
  currency: RequestCurrency,
  value: BigNumberValue,
) {
  return waitFor(
    () => sdk.balances.getBalance(address, currency),
    balance => {
      return balance.toString() === value.toString()
    },
  )
}
