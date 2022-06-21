import { Action } from "@rarible/action"
import type { OrderDataTypeRequest } from "@rarible/tezos-sdk/dist/main"
// eslint-disable-next-line camelcase
import { cancel, get_active_order_type, OrderType } from "@rarible/tezos-sdk/dist/main"
import type { TezosNetwork, TezosProvider } from "@rarible/tezos-sdk"
import type { IBlockchainTransaction } from "@rarible/sdk-transaction"
import { BlockchainTezosTransaction } from "@rarible/sdk-transaction"
import BigNumber from "bignumber.js"
import type { CancelV2OrderRequest } from "@rarible/tezos-sdk/dist/sales/cancel"
import { cancelV2 } from "@rarible/tezos-sdk/dist/sales/cancel"
import type { Order, TezosMTAssetType, TezosNFTAssetType } from "@rarible/api-client"
import type { CancelOrderRequest, ICancel } from "../../types/order/cancel/domain"
import type { IApisSdk } from "../../domain"
import type { ITezosAPI, MaybeProvider } from "./common"
import {
	convertFromContractAddress,
	convertOrderToOrderForm,
	getRequiredProvider,
	getTezosAddress,
	getTezosAssetTypeV2,
	getTokenIdString,
	isMTAssetType,
	isNftAssetType,
} from "./common"

export class TezosCancel {
	constructor(
		private provider: MaybeProvider<TezosProvider>,
		private apis: ITezosAPI,
		private unionAPI: IApisSdk,
		private network: TezosNetwork,
	) {
		this.cancelBasic = this.cancelBasic.bind(this)
	}

	cancel: ICancel = Action.create({
		id: "send-tx" as const,
		run: async (request: CancelOrderRequest) => {
			return this.cancelBasic(request)
		},
	})

	async cancelV2SellOrder(order: Order): Promise<IBlockchainTransaction> {
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
		const order = await this.unionAPI.order.getOrderById({ id: request.orderId })
		if (!order) {
			throw new Error("Order has not been found")
		}
		const { take } = order

		if (isNftAssetType(order.make.type) || isMTAssetType(order.make.type)) {
			const typeRequest: OrderDataTypeRequest = {
				contract: convertFromContractAddress(order.make.type.contract),
				token_id: new BigNumber(order.make.type.tokenId),
				seller: getTezosAddress(order.maker),
				buy_asset_contract: "contract" in take.type ? convertFromContractAddress(take.type.contract) : undefined,
				buy_asset_token_id: take.type["@type"] === "TEZOS_FT" ? getTokenIdString(take.type.tokenId) : undefined,
			}
			const type = await get_active_order_type(this.provider.config, typeRequest)
			if (type === OrderType.V2) {
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
	}
}
