import { Action } from "@rarible/action"
// eslint-disable-next-line camelcase
import { cancel } from "@rarible/tezos-sdk/dist/main"
import type { TezosNetwork, TezosProvider } from "@rarible/tezos-sdk"
import type { IBlockchainTransaction } from "@rarible/sdk-transaction"
import { BlockchainTezosTransaction } from "@rarible/sdk-transaction"
import BigNumber from "bignumber.js"
import type { CancelV2OrderRequest } from "@rarible/tezos-sdk/dist/sales/cancel"
import { cancelV2 } from "@rarible/tezos-sdk/dist/sales/cancel"
import type { Order, TezosMTAssetType, TezosNFTAssetType } from "@rarible/api-client"
import type { CancelOrderRequest, ICancel } from "../../types/order/cancel/domain"
import type { IApisSdk } from "../../domain"
import type { MaybeProvider } from "./common"
import {
	checkChainId,
	convertFromContractAddress,
	convertOrderToOrderForm,
	getRequiredProvider,
	getTezosAssetTypeV2,
	isMTAssetType,
	isNftAssetType,
} from "./common"

export class TezosCancel {
	constructor(
		private provider: MaybeProvider<TezosProvider>,
		private unionAPI: IApisSdk,
		private network: TezosNetwork,
	) {}

	cancel: ICancel = Action.create({
		id: "send-tx" as const,
		run: async (request: CancelOrderRequest) => {
			await checkChainId(this.provider)

			const order = await this.unionAPI.order.getOrderById({ id: request.orderId })
			if (!order) {
				throw new Error("Order has not been found")
			}
			if (isNftAssetType(order.make.type) || isMTAssetType(order.make.type)) {
				if (order.data["@type"] === "TEZOS_RARIBLE_V3") {
					return this.cancelV2SellOrder(order)
				}
			}

			const v1OrderForm = convertOrderToOrderForm(order)

			const tx = await cancel(
				getRequiredProvider(this.provider),
				v1OrderForm,
				false
			)

			return new BlockchainTezosTransaction(tx, this.network)
		},
	})

	async cancelV2SellOrder(order: Order): Promise<IBlockchainTransaction> {
		await checkChainId(this.provider)

		const provider = getRequiredProvider(this.provider)
		const currency = await getTezosAssetTypeV2(this.provider.config, order.take.type)
		const cancelRequest: CancelV2OrderRequest = {
			asset_contract: convertFromContractAddress((order.make.type as TezosNFTAssetType | TezosMTAssetType).contract),
			asset_token_id: new BigNumber((order.make.type as TezosNFTAssetType | TezosMTAssetType).tokenId),
			sale_asset_contract: currency.asset_contract,
			sale_asset_token_id: currency.asset_token_id,
			sale_type: currency.type,
		}
		const canceledOrder = await cancelV2(provider, cancelRequest)
		if (!canceledOrder) {
			throw new Error("Cancel transaction has not been returned")
		}
		return new BlockchainTezosTransaction(canceledOrder, this.network)
	}
}
