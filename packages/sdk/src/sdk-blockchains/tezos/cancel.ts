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
// eslint-disable-next-line camelcase
import { get_legacy_orders, order_of_json } from "@rarible/tezos-sdk"
import type { OrderForm } from "@rarible/tezos-sdk/dist/order"
// eslint-disable-next-line camelcase
import { cancel_bid } from "@rarible/tezos-sdk/dist/bids"
import type { CancelBid } from "@rarible/tezos-sdk/bids/index"
import type { CancelOrderRequest, ICancelAction } from "../../types/order/cancel/domain"
import type { IApisSdk } from "../../domain"
import type { MaybeProvider } from "./common"
import {
	checkChainId,
	convertFromContractAddress,
	getRequiredProvider,
	getTezosAssetTypeV2,
	getTezosOrderId,
	isMTAssetType,
	isNftAssetType,
} from "./common"

export class TezosCancel {
	constructor(
		private provider: MaybeProvider<TezosProvider>,
		private unionAPI: IApisSdk,
		private network: TezosNetwork,
	) {
		this.cancelBasic = this.cancelBasic.bind(this)
	}

	cancel: ICancelAction = Action.create({
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
			const provider = getRequiredProvider(this.provider)
			if (isNftAssetType(order.take.type) || isMTAssetType(order.take.type)) {
				const asset = await getTezosAssetTypeV2(provider.config, order.make.type)
				const bidData: CancelBid = {
					asset_contract: convertFromContractAddress(order.take.type.contract),
					asset_token_id: new BigNumber(order.take.type.tokenId),
					bid_type: asset.type,
					bid_asset_contract: asset.asset_contract,
					bid_asset_token_id: asset.asset_token_id,
				}
				console.log("bidData", bidData)
				const tx = await cancel_bid(provider, bidData)
				return new BlockchainTezosTransaction(tx, this.network)
			}

			const legacyOrders = await get_legacy_orders(
				provider.config, {
					data: true,
				}, {
					order_id: [getTezosOrderId(order.id)],
				})

			if (!legacyOrders.length) {
				throw new Error("Tezos v1 orders has not been found")
			}
			if (!legacyOrders[0] || !legacyOrders[0].data) {
				throw new Error("Tezos v1 order data is empty")
			}
			const orderForm = order_of_json(legacyOrders[0].data)
			const tx = await cancel(
				getRequiredProvider(this.provider),
				orderForm as OrderForm
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

	async cancelBasic(request: CancelOrderRequest): Promise<IBlockchainTransaction> {
		return this.cancel(request)
	}
}
