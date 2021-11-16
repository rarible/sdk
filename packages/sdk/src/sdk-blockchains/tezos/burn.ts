import type { Maybe } from "@rarible/types/build/maybe"
import type { Provider } from "tezos-sdk-module/dist/common/base"
import { toBigNumber } from "@rarible/types"
import { Action } from "@rarible/action"
import { burn } from "tezos-sdk-module"
import { BlockchainTezosTransaction } from "@rarible/sdk-transaction"
import BigNumber from "bignumber.js"
import type { BurnRequest, PrepareBurnRequest, PrepareBurnResponse } from "../../types/nft/burn/domain"
import type { ITezosAPI } from "./common"
import { getTezosItemData } from "./common"

export class TezosBurn {
	constructor(
		private provider: Maybe<Provider>,
		private apis: ITezosAPI,
	) {}

	private getRequiredProvider(): Provider {
		if (!this.provider) {
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
					const amount = request?.amount !== undefined ? new BigNumber(request.amount.toFixed()) : undefined

					const result = await burn(
						this.getRequiredProvider(),
						{
							contract: item.contract,
							token_id: new BigNumber(item.tokenId),
						},
						amount
					)

					return new BlockchainTezosTransaction(result)
				},
			}),
		}
	}
}
