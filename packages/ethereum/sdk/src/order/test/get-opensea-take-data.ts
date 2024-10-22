import type { BigNumberValue } from "@rarible/utils/build/bn"
import { toBn } from "@rarible/utils/build/bn"

export function getOpenseaEthTakeData(amount: BigNumberValue) {
  const sellerAmount = toBn(amount).multipliedBy("0.975")
  const feeRecipientAmount = toBn(amount).multipliedBy("0.025")
  return [
    {
      token: "0x0000000000000000000000000000000000000000",
      amount: sellerAmount.toString(),
      endAmount: sellerAmount.toString(),
    },
    {
      token: "0x0000000000000000000000000000000000000000",
      amount: feeRecipientAmount.toString(),
      endAmount: feeRecipientAmount.toString(),
      recipient: "0x0000a26b00c1f0df003000390027140000faa719",
    },
  ]
}
