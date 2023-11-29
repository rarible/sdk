import { toBigNumber } from "@rarible/types"
import { BigNumber, toBn } from "@rarible/utils"
import type { EthOrderFormAsset } from "@rarible/api-client/build/models/EthOrderFormAsset"
import type { Asset } from "@rarible/api-client"

export function addFee<T extends Asset | EthOrderFormAsset>(
	asset: T, fee: number | BigNumber
): T {
	const value = toBn(asset.value)
		.multipliedBy(toBn(fee).plus(10000))
		.dividedBy(10000)
		.integerValue(BigNumber.ROUND_FLOOR)

	return {
		...asset,
		value: toBigNumber(value.toFixed()),
	}
}
