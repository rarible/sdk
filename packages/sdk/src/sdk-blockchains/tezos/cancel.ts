import { Action } from "@rarible/action"
import { cancel } from "tezos-sdk-module/dist/main"
import type { TezosProvider } from "tezos-sdk-module/dist/common/base"
import { Provider } from "tezos-sdk-module/dist/common/base"
import type { Order } from "@rarible/api-client"
import BigNumber from "bignumber.js"
import { toBigNumber as toRaribleBigNumber } from "@rarible/types/build/big-number"
import { Asset } from "tezos-sdk-module/common/base"
import { OrderRaribleV2DataV1 } from "tezos-sdk-module/order/utils"
import type { CancelOrderRequest, ICancel } from "../../types/order/cancel/domain"
import type { ITezosAPI, MaybeProvider } from "./common"
import {
	convertOrderPayout,
	convertOrderToFillOrder,
	convertOrderToOrderForm,
	getMakerPublicKey,
	getRequiredProvider, getTezosAssetType,
	getTezosOrderId,
} from "./common"
import type { PreparedOrder } from "./fill"

export class TezosCancel {
	constructor(
		private provider: MaybeProvider<TezosProvider>,
		private apis: ITezosAPI,
	) {}

	cancel: ICancel = Action.create({
		id: "send-tx" as const,
		run: async (request: CancelOrderRequest) => {
			const order = await this.apis.order.getOrderByHash({
				hash: getTezosOrderId(request.orderId),
			})

			// convertOrderToOrderForm(order)

			cancel(
				getRequiredProvider(this.provider),
				{
					type: order.type,
					maker: order.maker,
					maker_edpk: order.makerEdpk,
					taker: order.taker,
					taker_edpk: order.takerEdpk,
					make: {
						asset_type: order.make.assetType,
						value: new BigNumber(order.make.value),
					},
					take: {
						asset_type: order.take.assetType,
						value: new BigNumber(order.take.value),
					},
					salt: order.salt,
					start: order.start,
					end: order.end,
					signature: order.signature,
					data: {
						data_type: "V1",
						payouts: convertOrderPayout(order.data.payouts),
						origin_fees: convertOrderPayout(order.data.originFees),
					},
				}
			)
		},
	})
}
