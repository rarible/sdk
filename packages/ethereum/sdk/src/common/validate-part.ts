import type { Part } from "@rarible/ethereum-api-client"
import { toAddress } from "@rarible/types"

export function validateParts(parts?: Part[]): Part[] {
	return parts?.map(part => ({
		account: toAddress(part.account),
		value: validatePartValue(part.value),
	})) || []
}

export function validatePartValue(value: number): number {
	if (isNaN(value) || value > 10000 || value < 0) {
		throw new Error("Part value should be valid and in range 0-10000")
	}
	return value
}
