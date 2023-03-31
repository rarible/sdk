import type { Address, Part } from "@rarible/ethereum-api-client"
import type { BigNumber } from "@rarible/types"
import { toBn } from "@rarible/utils"
import { BigNumber as BigNum } from "@rarible/utils"
import { toBigNumber, ZERO_ADDRESS } from "@rarible/types"


export const ZERO_FEE_VALUE = toBigNumber("0x" + "0".repeat(64))

/**
 * Pack 2 number value to single uint256 (BigNumber)
 * @param fees
 */
export function packFeesToUint(fees: [number | undefined, number | undefined]): BigNumber {
	const firstFee = getPackedFeeValue(fees[0])
	const secondFee = getPackedFeeValue(fees[1])
	return toBigNumber("0x" + "0".repeat(64 - 8) + firstFee + secondFee)
}

export function getPackedFeeValue(fee: number | undefined) {
	return fee?.toString(16).padStart(4, "0") ?? "0000"
}

/**
 * Check requirements for origin fees, converting them to single uint value for fee and list of fee receiver addresses
 * @param originFees
 */
export function originFeeValueConvert(originFees?: Part[]): {
	encodedFeesValue: BigNumber,
	totalFeeBasisPoints: number,
	feeAddresses: readonly [Address, Address]
} {
	if (originFees && originFees.length > 2) {
		throw new Error("This method supports max up to 2 origin fee values")
	}

	const encodedFeesValue = packFeesToUint([originFees?.[0]?.value, originFees?.[1]?.value])

	const addresses = [
		originFees?.[0]?.account ?? ZERO_ADDRESS,
		originFees?.[1]?.account ?? ZERO_ADDRESS,
	] as const

	const totalFeeBasisPoints = (originFees?.[0]?.value ?? 0) + (originFees?.[1]?.value ?? 0)

	return {
		encodedFeesValue,
		totalFeeBasisPoints,
		feeAddresses: addresses,
	}
}

/**
 * Add fee to value
 * @param value
 * @param feesBasisPoints
 */
export function calcValueWithFees(value: BigNumber | BigNum, feesBasisPoints: number): BigNum {
	const feesValue = toBn(feesBasisPoints)
		.dividedBy(10000)
		.multipliedBy(value)
		.integerValue(BigNum.ROUND_FLOOR)

	return feesValue.plus(value)
}

export function encodeBasisPointsPlusAccount(bp: number, account: Address): BigNumber {
	const bpConverted = toBn("0x" + bp.toString(16) + "0".repeat(40))
	return toBigNumber("0x" + bpConverted.plus(account).toString(16))
}
