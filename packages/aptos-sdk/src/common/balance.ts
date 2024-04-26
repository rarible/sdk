import type { Aptos, AccountAddressInput } from "@aptos-labs/ts-sdk"
import { toBn } from "@rarible/utils"
import type { BigNumber } from "@rarible/types"
import { toBigNumber } from "@rarible/types"
import { APT_DIVIDER } from "./index"
export class AptosBalance {
	constructor(
		private readonly aptos: Aptos
	) {}

  getBalance = async (accountAddress: AccountAddressInput): Promise<BigNumber> => {
  	const value = toBn(
  		await this.aptos.getAccountAPTAmount({ accountAddress })
  	).div(APT_DIVIDER)
  	return toBigNumber(value.toFixed())
  }
}
