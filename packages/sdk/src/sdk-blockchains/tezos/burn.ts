import { toBigNumber } from "@rarible/types"
import { Action } from "@rarible/action"
import { burn } from "@rarible/tezos-sdk"
import { BlockchainTezosTransaction } from "@rarible/sdk-transaction"
import type { TezosProvider, TezosNetwork, Provider } from "@rarible/tezos-sdk"
import BigNumber from "bignumber.js"
import type { NftCollection, NftItem } from "tezos-api-client/build"
import type { BurnRequest, BurnResponse, PrepareBurnRequest, PrepareBurnResponse } from "../../types/nft/burn/domain"
import type { BurnSimplifiedRequest } from "../../types/nft/burn/simplified"
import type { ITezosAPI, MaybeProvider } from "./common"
import { getRequestAmount, getTezosItemData, isExistedTezosProvider } from "./common"

export class TezosBurn {
	constructor(
		private provider: MaybeProvider<TezosProvider>,
		private apis: ITezosAPI,
		private network: TezosNetwork,
	) {
		this.burn = this.burn.bind(this)
		this.burnBasic = this.burnBasic.bind(this)
		this.burnCommon = this.burnCommon.bind(this)
	}

	private getRequiredProvider(): Provider {
		if (!isExistedTezosProvider(this.provider)) {
			throw new Error("Tezos provider is required")
		}
		return this.provider
	}

	async burn(prepare: PrepareBurnRequest): Promise<PrepareBurnResponse> {
		const { itemId, contract } = getTezosItemData(prepare.itemId)
		const item = await this.apis.item.getNftItemById({ itemId })

		const collection = await this.apis.collection.getNftCollectionById({
			collection: contract,
		})

		return {
			multiple: collection.type === "MT",
			maxAmount: toBigNumber(item.supply),
			submit: Action.create({
				id: "burn" as const,
				run: async (request: BurnRequest) => {
					return this.burnCommon(request, collection, item)
				},
			}),
		}
	}

	async burnBasic(request: BurnSimplifiedRequest): Promise<BurnResponse> {
		const { itemId, contract } = getTezosItemData(request.itemId)
		const item = await this.apis.item.getNftItemById({ itemId })

		const collection = await this.apis.collection.getNftCollectionById({
			collection: contract,
		})

		return this.burnCommon(request, collection, item)
	}

	async burnCommon(request: BurnSimplifiedRequest | BurnRequest, collection: NftCollection, item: NftItem) {
  	const result = await burn(
  		this.getRequiredProvider(),
  		{
  			contract: item.contract,
  			token_id: new BigNumber(item.tokenId),
  		},
			getRequestAmount(request?.amount, collection)
  	)

  	return new BlockchainTezosTransaction(result, this.network)
	}
}
