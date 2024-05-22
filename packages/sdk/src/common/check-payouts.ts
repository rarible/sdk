import { Warning } from "@rarible/logger/build"
import type { UnionPart } from "../types/order/common"

export function checkPayouts(payouts?: UnionPart[]): void {
  if (payouts?.length) {
    const payoutsAmount = payouts.reduce((acc, p) => (acc = acc + +p.value), 0)
    if (payoutsAmount !== 10000) {
      throw new Warning(
        `Sum of the values of Payouts objects should be equal to 10000 basis points, passed=${payoutsAmount}`,
      )
    }
  }
}
