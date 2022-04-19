import type { IRaribleSdk } from "@rarible/sdk/src/domain"
import type { UnionAddress } from "@rarible/types"
import { retry } from "@rarible/sdk/src/common/retry"
import type { BigNumberValue } from "@rarible/utils"
import type { RequestCurrency } from "@rarible/sdk/src"

export async function verifyBalance(sdk: IRaribleSdk, address: UnionAddress,
	assetType: RequestCurrency, amount: BigNumberValue) {
	console.log("Verify balance, union address=", address)
	console.log("Asset type=", assetType)
	console.log("Expected amount=", amount)
	await retry(15, 3000, async () => {
		const actual = await sdk.balances.getBalance(
			address,
			assetType
		)
		expect(actual).toBe(amount)
	})
}
