import { toBn } from "@rarible/utils"
import type { BigNumber, BigNumberValue } from "@rarible/utils"

export const gcd = (a: BigNumberValue, b: BigNumberValue): BigNumber => {
	const bnA = toBn(a)
	const bnB = toBn(b)

	if (bnA.eq(0)) {
		return bnB
	}

	return gcd(bnB.mod(a), bnA)
}

export const findGcd = (elements: BigNumberValue[]) => {
	let result = toBn(elements[0])

	for (let i = 1; i < elements.length; i++) {
		result = gcd(elements[i], result)

		if (result.eq(1)) {
			return result
		}
	}

	return result
}
