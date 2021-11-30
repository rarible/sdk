import type { TezosProvider } from "tezos-sdk-module"
import type { UnionAddress } from "@rarible/types"
import type { AssetType } from "@rarible/api-client"
import type { BigNumberValue } from "@rarible/utils"
// eslint-disable-next-line camelcase
import { get_balance } from "tezos-sdk-module"
import BigNumber from "bignumber.js"
import type { ITezosAPI, MaybeProvider } from "./common"
import { getRequiredProvider, getTezosAddress, getTezosAssetType } from "./common"

export class TezosBalance {
	constructor(
		private provider: MaybeProvider<TezosProvider>,
		private apis: ITezosAPI,
	) {
		this.getBalance = this.getBalance.bind(this)
	}

	async getBalance(address: UnionAddress, assetType: AssetType): Promise<BigNumberValue> {
		const tezosAssetType = getTezosAssetType(assetType)
		if (tezosAssetType.asset_class !== "XTZ" && tezosAssetType.asset_class !== "FT") {
			throw new Error("Unsupported asset type")
		}

		return new BigNumber(
			await get_balance(
				getRequiredProvider(this.provider),
				getTezosAddress(address),
				tezosAssetType
			)
		)
	}
}
