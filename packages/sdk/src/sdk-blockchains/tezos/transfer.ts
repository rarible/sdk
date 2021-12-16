import type { Provider, TezosNetwork } from "tezos-sdk-module/dist/common/base"
import { transfer } from "tezos-sdk-module"
import { Action } from "@rarible/action"
import { toBigNumber } from "@rarible/types"
import { toBn } from "@rarible/utils/build/bn"
import { BlockchainTezosTransaction } from "@rarible/sdk-transaction"
import type { TezosProvider } from "tezos-sdk-module/dist/common/base"
import type { PrepareTransferRequest, TransferRequest } from "../../types/nft/transfer/domain"
import type { PrepareTransferResponse } from "../../types/nft/transfer/domain"
import type { ITezosAPI, MaybeProvider } from "./common"
import { getTezosAddress, getTezosItemData, isExistedTezosProvider } from "./common"

export class TezosTransfer {
	constructor(
		private provider: MaybeProvider<TezosProvider>,
		private apis: ITezosAPI,
		private network: TezosNetwork,
	) {
		this.transfer = this.transfer.bind(this)
	}

	private getRequiredProvider(): Provider {
		if (!isExistedTezosProvider(this.provider)) {
			throw new Error("Tezos provider is required")
		}
		return this.provider
	}

	async transfer(prepare: PrepareTransferRequest): Promise<PrepareTransferResponse> {
		const { itemId, contract } = getTezosItemData(prepare.itemId)
		const item = await this.apis.item.getNftItemById({ itemId })
		const collection = await this.apis.collection.getNftCollectionById({
			collection: contract,
		})

		return {
			multiple: collection.type === "MT",
			maxAmount: toBigNumber(item.supply),
			submit: Action.create({
				id: "transfer" as const,
				run: async (request: TransferRequest) => {
					const amount = collection.type === "NFT" ? undefined : toBn((request.amount || 1).toFixed())

					const result = await transfer(
						this.getRequiredProvider(),
						{
							contract: item.contract,
							token_id: toBn(item.tokenId),
						},
						getTezosAddress(request.to),
						amount,
					)

					return new BlockchainTezosTransaction(result, this.network)
				},
			}),
		}
	}
}
