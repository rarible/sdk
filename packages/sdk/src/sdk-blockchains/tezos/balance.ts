import type { TezosProvider, TezosNetwork } from "@rarible/tezos-sdk"
import type { UnionAddress } from "@rarible/types"
import type { BigNumberValue } from "@rarible/utils"
// eslint-disable-next-line camelcase
import { get_balance } from "@rarible/tezos-sdk"
import BigNumber from "bignumber.js"
import type { RequestCurrency } from "../../common/domain"
import { getCurrencyAssetType } from "../../common/get-currency-asset-type"
import type { MaybeProvider } from "./common"
import { getTezosAddress, getTezosAssetTypeV2 } from "./common"

export class TezosBalance {
	constructor(
		private provider: MaybeProvider<TezosProvider>,
		private network: TezosNetwork,
	) {
		this.getBalance = this.getBalance.bind(this)
	}

	async getBalance(address: UnionAddress, currency: RequestCurrency): Promise<BigNumberValue> {
		const assetType = getCurrencyAssetType(currency)
		const tezosAssetType = await getTezosAssetTypeV2(this.provider.config, assetType)
		if (assetType["@type"] !== "XTZ" && assetType["@type"] !== "TEZOS_FT") {
			throw new Error("Unsupported asset type")
		}
		if (!this.provider.config.node_url) {
			throw new Error("Node url for tezos has not been specified")
		}
		return new BigNumber(
			await get_balance(
				this.provider.config,
				getTezosAddress(address),
				tezosAssetType.type,
				tezosAssetType.asset_contract,
				tezosAssetType.asset_token_id,
			)
		)
	}
}
