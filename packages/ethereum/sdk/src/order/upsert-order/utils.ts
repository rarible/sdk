import type { BigNumber as BigNumberIsh, Word } from "@rarible/types"
import { toBinary, toBigNumber, randomWord } from "@rarible/types"
import { toBn } from "@rarible/utils"

export function generateOrderSalt(): BigNumberIsh {
	return toBigNumber(toBn(randomWord(), 16).toString(10))
}

export function saltToBinary(salt: BigNumberIsh): Word {
	// @todo the bug is in typings of @rarible/ethereum-api-client
	// order.salt must be Binary instead of Word type
	return toBinary(toBn(salt, 10).toString(16)) as unknown as Word
}