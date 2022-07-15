import { toBigNumber } from "@rarible/types"
import { Action } from "@rarible/action"
import { burn } from "@rarible/tezos-sdk"
import { BlockchainTezosTransaction } from "@rarible/sdk-transaction"
import type { TezosProvider, TezosNetwork, Provider } from "@rarible/tezos-sdk"
import BigNumber from "bignumber.js"
import type { BurnRequest, PrepareBurnRequest, PrepareBurnResponse } from "../../types/nft/burn/domain"
import type { IApisSdk } from "../../domain"
import type { MaybeProvider } from "./common"
import {
	getCollectionType,
	getCollectionTypeAssetClass,
	getTezosItemData,
	isExistedTezosProvider,
	checkChainId,
} from "./common"

export class TezosBurn {
	constructor(
		private provider: MaybeProvider<TezosProvider>,
		private unionAPI: IApisSdk,
		private network: TezosNetwork,
	) {
		this.burn = this.burn.bind(this)
	}

	private getRequiredProvider(): Provider {
		if (!isExistedTezosProvider(this.provider)) {
			throw new Error("Tezos provider is required")
		}
		return this.provider
	}

	async burn(prepare: PrepareBurnRequest): Promise<PrepareBurnResponse> {
		await checkChainId(this.provider)

		const { contract, tokenId } = getTezosItemData(prepare.itemId)
		const item = await this.unionAPI.item.getItemById({ itemId: prepare.itemId })
		const collectionType = await getCollectionType(this.provider, contract)

		return {
			multiple: collectionType === "TEZOS_MT",
			maxAmount: toBigNumber(item.supply),
			submit: Action.create({
				id: "burn" as const,
				run: async (request: BurnRequest) => {
					const amount = collectionType === "TEZOS_MT" ? new BigNumber((request?.amount ?? 1).toFixed()) : undefined

					const result = await burn(
						this.getRequiredProvider(),
						{
							asset_class: getCollectionTypeAssetClass(collectionType),
							contract,
							token_id: new BigNumber(tokenId),
						},
						amount
					)

					return new BlockchainTezosTransaction(result, this.network)
				},
			}),
		}
	}
}
