import type { Provider, TezosProvider, TezosNetwork } from "@rarible/tezos-sdk"
import { transfer } from "@rarible/tezos-sdk"
import { Action } from "@rarible/action"
import { toBigNumber } from "@rarible/types"
import type { IBlockchainTransaction } from "@rarible/sdk-transaction"
import { BlockchainTezosTransaction } from "@rarible/sdk-transaction"
import BigNumber from "bignumber.js"
import type { PrepareTransferRequest, TransferRequest } from "../../types/nft/transfer/domain"
import type { PrepareTransferResponse } from "../../types/nft/transfer/domain"
import type { IApisSdk } from "../../domain"
import type { TransferSimplifiedRequest } from "../../types/nft/transfer/simplified"
import type { MaybeProvider } from "./common"
import {
	getCollectionTypeAssetClass,
	getTezosAddress,
	getTezosItemData,
	isExistedTezosProvider,
	checkChainId, getRequestAmount,
} from "./common"
import { getCollectionType } from "./common/get-collection-type"

export class TezosTransfer {
	constructor(
		private provider: MaybeProvider<TezosProvider>,
		private unionAPI: IApisSdk,
		private network: TezosNetwork,
	) {
		this.transfer = this.transfer.bind(this)
		this.transferBasic = this.transferBasic.bind(this)
	}

	private getRequiredProvider(): Provider {
		if (!isExistedTezosProvider(this.provider)) {
			throw new Error("Tezos provider is required")
		}
		return this.provider
	}

	async transfer(prepare: PrepareTransferRequest): Promise<PrepareTransferResponse> {
		await checkChainId(this.provider)

		const { contract, tokenId } = getTezosItemData(prepare.itemId)
		const item = await this.unionAPI.item.getItemById({ itemId: prepare.itemId })
		const collectionType = await getCollectionType(this.provider, contract)

		return {
			multiple: collectionType === "TEZOS_MT",
			maxAmount: toBigNumber(item.supply),
			submit: Action.create({
				id: "transfer" as const,
				run: async (request: TransferRequest) => {
					const result = await transfer(
						this.getRequiredProvider(),
						{
							asset_class: getCollectionTypeAssetClass(collectionType),
							contract,
							token_id: new BigNumber(tokenId),
						},
						getTezosAddress(request.to),
						getRequestAmount(request?.amount, collectionType),
					)

					return new BlockchainTezosTransaction(result, this.network)
				},
			}),
		}
	}

	async transferBasic(request: TransferSimplifiedRequest): Promise<IBlockchainTransaction> {
		const response = await this.transfer(request)
		return response.submit(request)
	}
}
