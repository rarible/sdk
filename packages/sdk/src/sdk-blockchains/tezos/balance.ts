import type { TezosProvider, TezosNetwork } from "@rarible/tezos-sdk"
import type { UnionAddress } from "@rarible/types"
import type { AssetType } from "@rarible/api-client"
import type { BigNumberValue } from "@rarible/utils"
// eslint-disable-next-line camelcase
import { get_balance, unwrap, wrap } from "@rarible/tezos-sdk"
import BigNumber from "bignumber.js"
import type { IBlockchainTransaction } from "@rarible/sdk-transaction"
import { BlockchainTezosTransaction } from "@rarible/sdk-transaction"
import type { Blockchain } from "@rarible/api-client"
import type { MaybeProvider } from "./common"
import { getRequiredProvider, getTezosAddress, getTezosAssetType } from "./common"

export class TezosBalance {
	constructor(
		private provider: MaybeProvider<TezosProvider>,
		private network: TezosNetwork,
	) {
		this.getBalance = this.getBalance.bind(this)
		this.convert = this.convert.bind(this)
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

	async convert(blockchain: Blockchain, isWrap: boolean, value: BigNumberValue): Promise<IBlockchainTransaction> {
		const provider = getRequiredProvider(this.provider)
		if (isWrap) {
			const tx = await wrap(provider, new BigNumber(value))
			return new BlockchainTezosTransaction(tx, this.network)
		} else {
			const tx = await unwrap(provider, new BigNumber(value))
			return new BlockchainTezosTransaction(tx, this.network)
		}
	}
}
