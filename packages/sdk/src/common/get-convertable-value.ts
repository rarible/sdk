import type { AssetType } from "@rarible/api-client"
import type { UnionAddress } from "@rarible/types"
import type { BigNumberValue } from "@rarible/utils"
import BigNumber from "bignumber.js"
import type { GetConvertableValueRequest, GetConvertableValueResult } from "../types/order/bid/domain"

export async function getCommonConvertableValue(
	getBalance: (address: UnionAddress, assetType: AssetType) => Promise<BigNumberValue>,
	// request: GetConvertableValueRequest,
	walletAddress: UnionAddress,
	valueWithFee: BigNumber,
	from: AssetType,
	to: AssetType,
	// fee: BigNumber,
): Promise<GetConvertableValueResult> {
	const wrappedTokenBalance = await getBalance(walletAddress, to)

	console.log("getCommonConvertableValue: wallet", walletAddress, "from", from, "to", to, "value with fee", valueWithFee.toString())
	// const valueWithFee = new BigNumber(request.value).plus(fee)

	console.log("wrappedTokenBalance", wrappedTokenBalance.toString(), "valueWithFee", valueWithFee.toString())
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
