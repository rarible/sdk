import type { Maybe } from "@rarible/types/build/maybe"
import type { Provider } from "tezos-sdk-module/dist/common/base"
import { transfer } from "tezos-sdk-module"
import { Action } from "@rarible/action"
import { toBigNumber } from "@rarible/types"
import { toBn } from "@rarible/utils/build/bn"
import { BlockchainTezosTransaction } from "@rarible/sdk-transaction"
import type { PrepareTransferRequest, TransferRequest } from "../../types/nft/transfer/domain"
import type { PrepareTransferResponse } from "../../types/nft/transfer/domain"
import type { ITezosAPI } from "./common"
import { getTezosItemData } from "./common"

export class TezosTransfer {
	constructor(
		private provider: Maybe<Provider>,
		private apis: ITezosAPI,
	) {
		this.transfer = this.transfer.bind(this)
	}

	private getRequiredProvider(): Provider {
		if (!this.provider) {
			throw new Error("Tezos provider is required")
		}
		return this.provider
	}

	async transfer(prepare: PrepareTransferRequest): Promise<PrepareTransferResponse> {
		const { itemId, contract } = getTezosItemData(prepare.itemId)
		console.log("getTezosItemData", itemId)
		const item = await this.apis.item.getNftItemById({ itemId })

		const collection = await this.apis.collection.getNftCollectionById({
			collection: contract,
		})

		console.log("transfer item", item)
		return {
			multiple: collection.type === "MT",
			maxAmount: toBigNumber(item.supply),
			submit: Action.create({
				id: "transfer" as const,
				run: async (request: TransferRequest) => {
					const amount = request.amount !== undefined ? toBn(request.amount.toFixed()) : undefined

					const result = await transfer(
						this.getRequiredProvider(),
						{
							contract: item.contract,
							token_id: toBn(item.tokenId),
						},
						request.to,
						amount,
					)

					return new BlockchainTezosTransaction(result)
				},
			}),
		}
	}
}
