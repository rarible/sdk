import type { EVMAddress, Part } from "@rarible/ethereum-api-client"
import type { BigNumber } from "@rarible/types"
import { EVM_ZERO_ADDRESS } from "@rarible/types"
import { packFeesToUint, ZERO_FEE_VALUE } from "./origin-fees-utils"

/**
 * Class used to reduce multiple originFee Part records (from different fill requests) to 2 values.
 */
export class OriginFeeReducer {
  private readonly addresses: [EVMAddress, EVMAddress]

  constructor() {
    this.addresses = [EVM_ZERO_ADDRESS, EVM_ZERO_ADDRESS]
  }

  /**
   * Reduce fees to converted single uint fee value
   * @param originFees
   */
  reduce(originFees: Part[] | undefined): BigNumber {
    if (!originFees?.length) {
      return ZERO_FEE_VALUE
    }

    const reducedArray = this.getReducedFeesArray(originFees)

    return packFeesToUint(reducedArray)
  }

  getReducedFeesArray(originFees: Part[] | undefined): [number, number] {
    if (!originFees?.length) {
      return [0, 0]
    }

    if (originFees.length > 2) {
      throw new Error("Supports max up to 2 different origin fee address per request")
    }

    return originFees.reduce<[number, number]>(
      (acc, originFee: Part) => {
        const res = this.reducePart(originFee)
        acc[0] += res[0]
        acc[1] += res[1]
        return acc
      },
      [0, 0],
    )
  }

  getComplexReducedFeesData(originFees: Part[] | undefined): ComplexFeesReducedData {
    const reducedArray = this.getReducedFeesArray(originFees)
    return {
      encodedFeesValue: packFeesToUint(reducedArray),
      totalFeeBasisPoints: reducedArray[0] + reducedArray[1],
    }
  }

  /**
   * Return addresses for fees
   */
  getAddresses(): [EVMAddress, EVMAddress] {
    return this.addresses
  }

  private reducePart(part: Part): [number, number] {
    let firstFee = 0
    let secondFee = 0

    if (part.account === this.addresses[0]) {
      firstFee += part.value
    } else if (part.account === this.addresses[1]) {
      secondFee += part.value
    } else if (this.addresses[0] === EVM_ZERO_ADDRESS) {
      firstFee += part.value
      this.addresses[0] = part.account
    } else if (this.addresses[1] === EVM_ZERO_ADDRESS) {
      secondFee += part.value
      this.addresses[1] = part.account
    } else {
      throw new Error("Supports max up to 2 different origin fee address per request")
    }

    return [firstFee, secondFee]
  }
}

export type ComplexFeesReducedData = {
  encodedFeesValue: BigNumber
  totalFeeBasisPoints: number
}
