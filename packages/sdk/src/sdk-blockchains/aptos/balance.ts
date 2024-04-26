import type { AptosSdk } from "@rarible/aptos-sdk"
import type { UnionAddress } from "@rarible/types"
import type { BigNumber } from "@rarible/utils"
import { extractId } from "@rarible/sdk-common"
import { toBn } from "@rarible/utils"
import { getCurrencyAssetType } from "../../common/get-currency-asset-type"
import type { RequestCurrency } from "../../common/domain"

export class AptosBalance {
	constructor(
		private readonly sdk: AptosSdk,
	) {
		this.getBalance = this.getBalance.bind(this)
	}

	async getBalance(address: UnionAddress, currency: RequestCurrency): Promise<BigNumber> {
		const type = getCurrencyAssetType(currency)
		if (type["@type"] === "CURRENCY_NATIVE") {
			const balance = await this.sdk.balance.getAptosBalance({
				address: extractId(address),
			})
			return toBn(balance)
		}
		throw new Error("Unsupported Aptos currency")
	}
}
