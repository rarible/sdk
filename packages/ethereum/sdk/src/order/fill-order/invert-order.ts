import type { Address, Word } from "@rarible/types"
import { toBigNumber, toWord } from "@rarible/types"
import type { BigNumberValue } from "@rarible/utils/build/bn"
import { toBn } from "@rarible/utils/build/bn"
import type { SimpleOrder } from "../types"
import { isNft } from "../is-nft"

const ZERO = toWord("0x0000000000000000000000000000000000000000000000000000000000000000")
export function invertOrder<T extends SimpleOrder>(
	order: T,
	amount: BigNumberValue,
	maker: Address,
	salt: Word = ZERO
): T {
	const [makeValue, takeValue] = calculateAmounts(
		toBn(order.make.value),
		toBn(order.take.value),
		amount,
		isNft(order.take.assetType) || order.take.assetType.assetClass === "COLLECTION"
	)
	return {
		...order,
		make: {
			...order.take,
			value: toBigNumber(makeValue.toString()),
		},
		take: {
			...order.make,
			value: toBigNumber(takeValue.toString()),
		},
		maker,
		taker: order.maker,
		salt,
		signature: undefined,
	}
}

function calculateAmounts(
	make: BigNumberValue,
	take: BigNumberValue,
	amount: BigNumberValue,
	bid: boolean
): [BigNumberValue, BigNumberValue] {
	if (bid) {
		return [amount, toBn(amount).multipliedBy(make).div(take)]
	} else {
		return [toBn(amount).multipliedBy(take).div(make), amount]
	}
}
