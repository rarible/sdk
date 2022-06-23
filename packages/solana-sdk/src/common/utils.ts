import type BigNumber from "bignumber.js"
import { BN } from "@project-serum/anchor"
import type { BigNumberValue } from "@rarible/utils"

export function bnToBuffer(value: BN, endian: BN.Endianness, length: number) {
	return value.toArrayLike(Buffer, endian, length)
}

export function bigNumToBuffer(value: BigNumber, endian: BN.Endianness, length: number) {
	return bnToBuffer(bigNumToBn(value), endian, length)
}

export function bigNumToBn(value: BigNumberValue) {
	return new BN(value.toString())
}

/**
 * align BN internal representation to minimum len size
 * @param value
 * @param len
 */
export function alignBn(value: BN, len: number): BN {
	return new BN(bnToBuffer(value, "le", len))
}
