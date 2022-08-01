import type { Part } from "@rarible/ethereum-api-client"
import { ZERO_ADDRESS } from "@rarible/types"
import { convertFees, validateImxFeePercents } from "./convert-fees"

describe("convertFees test", () => {
	test("validateImxFeePercents: should verify values (do not throw or throw error)", () => {
		expect(() => validateImxFeePercents(100)).not.toThrow()
		expect(() => validateImxFeePercents(0)).not.toThrow()
		expect(() => validateImxFeePercents(-0)).not.toThrow()
		expect(() => validateImxFeePercents(50)).not.toThrow()
		expect(() => validateImxFeePercents(101)).toThrow()
		expect(() => validateImxFeePercents(-1)).toThrow()
	})
	test("convertFees: should convert or throw", () => {
		expect(convertFees(validFees).length).toEqual(3)
		expect(() => convertFees(notValidFees)).toThrow()
	})
})

const validFees: Part[] = [
	{ account: ZERO_ADDRESS, value: 10000 },
	{ account: ZERO_ADDRESS, value: 1 },
	{ account: ZERO_ADDRESS, value: 500 },
	{ account: ZERO_ADDRESS, value: 0 },
]

const notValidFees: Part[] = [
	{ account: ZERO_ADDRESS, value: 10001 },
]
