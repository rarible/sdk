import type { BigNumberValue } from "@rarible/utils/build/bn"
import { toBn } from "@rarible/utils/build/bn"

export function getOpenseaEthTakeData(amount: BigNumberValue) {
	const sellerAmount = toBn(amount).multipliedBy("0.975")
	const feeRecipientAmount = toBn(amount).multipliedBy("0.025")
	return [
		{
			"token": "0x0000000000000000000000000000000000000000",
			"amount": sellerAmount.toString(),
			"endAmount": sellerAmount.toString(),
		},
		{
			"token": "0x0000000000000000000000000000000000000000",
			"amount": feeRecipientAmount.toString(),
			"endAmount": feeRecipientAmount.toString(),
			"recipient": "0x8de9c5a032463c561423387a9648c5c7bcc5bc90",
		},
	]
}
