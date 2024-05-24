import useSwr from "swr"
import type { IRaribleSdk } from "@rarible/sdk"
import type { UnionAddress } from "@rarible/types/build/union-address"
import type { RequestCurrency } from "@rarible/sdk/build/common/domain"

export function useGetBalance(sdk: IRaribleSdk, address: UnionAddress, type: RequestCurrency) {
  return useSwr([address, type], ([...args]) => sdk.balances.getBalance(...args))
}
