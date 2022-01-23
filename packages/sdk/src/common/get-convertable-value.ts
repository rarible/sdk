import type { AssetType } from "@rarible/api-client"
import type { UnionAddress } from "@rarible/types"
import type { BigNumberValue } from "@rarible/utils"
import BigNumber from "bignumber.js"
import type { GetConvertableValueResult } from "../types/order/bid/domain"

export async function getCommonConvertableValue(
	getBalance: (address: UnionAddress, assetType: AssetType) => Promise<BigNumberValue>,
	walletAddress: UnionAddress,
	valueWithFee: BigNumber,
	from: AssetType,
	to: AssetType,
): Promise<GetConvertableValueResult> {
	const wrappedTokenBalance = await getBalance(walletAddress, to)

	if (new BigNumber(wrappedTokenBalance).gte(valueWithFee)) {
		return undefined
	}

	const fromBalance = await getBalance(walletAddress, from)

	if (new BigNumber(fromBalance).plus(wrappedTokenBalance).gte(valueWithFee)) {
		return {
			type: "convertable",
			currency: from,
			value: new BigNumber(valueWithFee).minus(wrappedTokenBalance),
		}
	}

	return {
		type: "insufficient",
		currency: from,
		value: new BigNumber(valueWithFee).minus(fromBalance),
	}

}
