import type { UnionAddress } from "@rarible/types"
import type { AssetType } from "@rarible/api-client"
import type { BigNumberValue } from "@rarible/utils"
import type { FlowSdk } from "@rarible/flow-sdk"
import { toBn } from "@rarible/utils/build/bn"
import { parseFlowAddressFromUnionAddress } from "./common/converters"
import { getFlowCurrencyFromAssetType } from "./common/get-flow-currency-from-asset-type"

export class FlowBalance {
	constructor(private sdk: FlowSdk) {
		this.getBalance = this.getBalance.bind(this)
	}

	async getBalance(address: UnionAddress, assetType: AssetType): Promise<BigNumberValue> {
		const flowAddress = parseFlowAddressFromUnionAddress(address)
		const flowAsset = getFlowCurrencyFromAssetType(assetType)
		const balance = await this.sdk.wallet.getFungibleBalance(flowAddress, flowAsset)
		return toBn(balance)
	}
}
