import type { Address } from "@rarible/types"
import type { Erc20AssetType, EthAssetType } from "@rarible/ethereum-api-client"
import type { BigNumberValue } from "@rarible/utils"
import { toBn } from "@rarible/utils"
import type { ImxEnv } from "@rarible/immutable-wallet"
import type { ImxApis } from "../apis"

export type BalanceRequestAssetType = EthAssetType | Erc20AssetType

export async function getBalance(
	env: ImxEnv,
	apis: ImxApis,
	address: Address,
	assetType: BalanceRequestAssetType,
): Promise<BigNumberValue> {
	const DEFAULT_DECIMALS = 18

	const { result } = await apis.balance.getAllBalances({ ownerAddress: address })
	if (assetType.assetClass === "ETH") {
		const currencyBalance = result.find((b => b.token_address === ""))

		if (currencyBalance) {
			return toBn(currencyBalance.balance.toString()).dividedBy(10 ** DEFAULT_DECIMALS)
		}
	} else if (assetType.assetClass === "ERC20") {
		const currencyBalance = result.find(b => b.token_address?.toLowerCase() === assetType.contract.toLowerCase() )

		if (currencyBalance) {
			return toBn(currencyBalance.balance.toString()).dividedBy(10 ** DEFAULT_DECIMALS)
		}
	}

	return toBn("0")
}
