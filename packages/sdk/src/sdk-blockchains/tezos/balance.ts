import type { TezosProvider } from "@rarible/tezos-sdk"
import type { UnionAddress } from "@rarible/types"
import type { AssetType } from "@rarible/api-client"
import type { BigNumberValue } from "@rarible/utils"
// eslint-disable-next-line camelcase
import { get_balance } from "@rarible/tezos-sdk"
import BigNumber from "bignumber.js"
import type { MaybeProvider } from "./common"
import { getTezosAddress, getTezosAssetType } from "./common"

export class TezosBalance {
	constructor(
		private provider: MaybeProvider<TezosProvider>,
	) {
		this.getBalance = this.getBalance.bind(this)
	}

	async getBalance(address: UnionAddress, assetType: AssetType): Promise<BigNumberValue> {
		const tezosAssetType = getTezosAssetType(assetType)
		if (tezosAssetType.asset_class !== "XTZ" && tezosAssetType.asset_class !== "FT") {
			throw new Error("Unsupported asset type")
		}
		if (!this.provider.config.node_url) {
			throw new Error("Node url for tezos has not been specified")
		}
		return new BigNumber(
			await get_balance(
				this.provider.config,
				getTezosAddress(address),
				tezosAssetType
			)
		)
	}
}
