import type { BN } from "@project-serum/anchor"

export function bnToBuffer(value: BN, endian: BN.Endianness, length: number) {
	return value.toArrayLike(Buffer, endian, length)
}
