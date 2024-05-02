import {
	APTOS_COIN,
} from "@aptos-labs/ts-sdk"
import type {
	Aptos,
} from "@aptos-labs/ts-sdk"
import { toBn } from "@rarible/utils"
import type { BigNumber } from "@rarible/types"
import { toBigNumber } from "@rarible/types"

export class AptosBalance {
	constructor(readonly aptos: Aptos) {}

	async getAptosBalance({ address }: { address: string }): Promise<BigNumber> {
		const [balance] = await this.aptos.getAccountCoinsData({
			accountAddress: address,
			options: {
				where: {
					asset_type: {
						_eq: APTOS_COIN,
					},
				},
			},
		})
		if (!balance) {
			return toBigNumber("0")
		}
		return toBigNumber(
			toBn(balance.amount)
				.div(
					toBn(10).pow(balance.metadata?.decimals || 8)
				)
				.toFixed()
		)
	}
}
