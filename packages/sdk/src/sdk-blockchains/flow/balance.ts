import type { UnionAddress } from "@rarible/types"
import type { BigNumberValue } from "@rarible/utils"
import type { FlowSdk } from "@rarible/flow-sdk"
import { toBn } from "@rarible/utils/build/bn"
import type { Maybe } from "@rarible/types/build/maybe"
import type { FlowWallet } from "@rarible/sdk-wallet"
import type { FlowEnv } from "@rarible/flow-sdk/build/types"
import { getCurrencyAssetType } from "../../common/get-currency-asset-type"
import type { RequestCurrency } from "../../common/domain"
import { parseFlowAddressFromUnionAddress } from "./common/converters"
import { getFlowCurrencyFromAssetType } from "./common/get-flow-currency-from-asset-type"
import { getSimpleFlowFungibleBalance } from "./balance-simple"

export class FlowBalance {
	constructor(
		private sdk: FlowSdk,
		private network: FlowEnv,
		private wallet: Maybe<FlowWallet>
	) {
		this.getBalance = this.getBalance.bind(this)
	}

	async getBalance(address: UnionAddress, currency: RequestCurrency): Promise<BigNumberValue> {
		const assetType = getCurrencyAssetType(currency)
		if (this.wallet) {
			const flowAddress = parseFlowAddressFromUnionAddress(address)
			const flowAsset = getFlowCurrencyFromAssetType(assetType)
		  const balance = await this.sdk.wallet.getFungibleBalance(flowAddress, flowAsset)
			return toBn(balance)
		}
		return getSimpleFlowFungibleBalance(this.network, address, assetType)
	}
}
