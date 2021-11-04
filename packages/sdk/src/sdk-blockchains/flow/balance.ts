import type { UnionAddress } from "@rarible/types"
import type { AssetType } from "@rarible/api-client"
import type { BigNumberValue } from "@rarible/utils"
import type { FlowSdk } from "@rarible/flow-sdk"
import { toBn } from "@rarible/utils/build/bn"
import { getFungibleTokenName, parseFlowAddressFromUnionAddress } from "./common/converters"

export class FlowBalance {
	constructor(private sdk: FlowSdk) {
		this.getBalance = this.getBalance.bind(this)
	}

	private getFlowCurrency(assetType: AssetType) {
		if (assetType["@type"] === "FLOW_FT") {
			return getFungibleTokenName(assetType.contract)
		}
		throw new Error("Invalid asset type")
	}

	async getBalance(address: UnionAddress, assetType: AssetType): Promise<BigNumberValue> {
		const flowAddress = parseFlowAddressFromUnionAddress(address)
		const flowAsset = this.getFlowCurrency(assetType)
		const balance = await this.sdk.wallet.getFungibleBalance(flowAddress, flowAsset)
		return toBn(balance)
	}
}
