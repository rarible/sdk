import type { Order, OrderId } from "@rarible/api-client"
import type { BigNumberValue } from "@rarible/utils"
import { toBn } from "@rarible/utils"
import type { IRaribleSdk } from "../../domain"
import { subsetMatch } from "../match-subset"
import { waitFor } from "../wait-for"

export async function awaitOrderMakeStock(sdk: IRaribleSdk, orderId: OrderId, value: BigNumberValue) {
  return awaitOrder(sdk, orderId, x => {
    if (x.makeStock) return toBn(x.makeStock).isEqualTo(value)
    return false
  })
}

export async function awaitOrder(sdk: IRaribleSdk, orderHash: OrderId, predicate?: (value: Order) => boolean) {
  return waitFor(() => sdk.apis.order.getOrderById({ id: orderHash }), predicate)
}

export function awaitOrderSubset(sdk: IRaribleSdk, orderHash: OrderId, subset: Partial<Order>) {
  return awaitOrder(sdk, orderHash, x => subsetMatch(x, subset))
}
