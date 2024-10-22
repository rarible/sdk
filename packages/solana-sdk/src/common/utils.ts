import { BN as SerumBN } from "@project-serum/anchor"
import type { BigNumberValue } from "@rarible/utils"

export function bnToBuffer(value: SerumBN, endian: SerumBN.Endianness, length: number) {
  return value.toArrayLike(Buffer, endian, length)
}

export function serumBnToBuffer(value: SerumBN, endian: SerumBN.Endianness, length: number) {
  return bnToBuffer(value, endian, length)
}

export function toSerumBn(value: BigNumberValue) {
  return new SerumBN(value.toString())
}

/**
 * align BN internal representation to minimum len size
 * @param value - value
 * @param len - len
 */
export function alignBn(value: SerumBN, len: number): SerumBN {
  return new SerumBN(bnToBuffer(value, "le", len))
}
