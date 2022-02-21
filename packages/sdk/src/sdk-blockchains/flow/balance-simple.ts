import type { FlowEnv } from "@rarible/flow-sdk/build/types"
import type { UnionAddress } from "@rarible/types"
import type { AssetType } from "@rarible/api-client"
import type { BigNumberValue } from "@rarible/utils"
import { getFungibleBalanceSimple } from "@rarible/flow-sdk"
import { ENV_CONFIG } from "@rarible/flow-sdk/build/config/env"
import { toBn } from "@rarible/utils/build/bn"
import { getFlowCurrencyFromAssetType } from "./common/get-flow-currency-from-asset-type"
import { parseFlowAddressFromUnionAddress } from "./common/converters"

export async function getSimpleFlowFungibleBalance(
	network: FlowEnv, address: UnionAddress, assetType: AssetType
): Promise<BigNumberValue> {
	const flowAddress = parseFlowAddressFromUnionAddress(address)
	const currency = getFlowCurrencyFromAssetType(assetType)
	const balance = await getFungibleBalanceSimple({
		network: ENV_CONFIG[network].network,
		address: flowAddress,
		currency,
	})
	return toBn(balance)
}
