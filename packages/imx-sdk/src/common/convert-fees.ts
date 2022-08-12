import type { Part } from "@rarible/ethereum-api-client"
import { BigNumber } from "@rarible/utils"
import type { ImxFee } from "../domain"

export function convertFees(fee?: Part[]): ImxFee[] {
	const prepared = fee?.map(f => {
		const value = (new BigNumber(f.value)).div(100).toNumber()
		validateImxFeePercents(value)
		return { recipient: f.account, percentage: value }
	})
	return prepared?.filter(v => v.percentage !== 0) || []
}

export function validateImxFeePercents(value: number) {
	if (value < 0 || value > 100) {
		throw new Error("Invalid value for fee, should be a number greater then 0 and lower then")
	}
}
