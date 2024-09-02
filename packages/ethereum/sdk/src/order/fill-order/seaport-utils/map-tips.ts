import type { BigNumberValue } from "@rarible/utils/build/bn"
import { BigNumber, toBn } from "@rarible/utils"
import type { ConsiderationItem } from "./types"

export function mapTipAmountsFromUnitsToFill(
  tips: ConsiderationItem[],
  unitsToFill: BigNumberValue,
  totalSize: BigNumberValue,
): ConsiderationItem[] {
  const unitsToFillBn = toBn(unitsToFill)

  if (unitsToFillBn.isLessThanOrEqualTo(0)) {
    throw new Error("Units to fill must be greater than 0")
  }

  return tips.map(tip => ({
    ...tip,
    startAmount: multiplyDivision(tip.startAmount, unitsToFillBn, totalSize).toString(),
    endAmount: multiplyDivision(tip.endAmount, unitsToFillBn, totalSize).toString(),
  }))
}

const multiplyDivision = (amount: BigNumberValue, numerator: BigNumberValue, denominator: BigNumberValue) =>
  toBn(amount).multipliedBy(numerator).div(denominator).integerValue(BigNumber.ROUND_FLOOR)
