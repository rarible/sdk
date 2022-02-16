import { Action } from "@rarible/action"
import { cancel } from "@rarible/tezos-sdk/dist/main"
import type { TezosProvider, TezosNetwork } from "@rarible/tezos-sdk"
import { BlockchainTezosTransaction } from "@rarible/sdk-transaction"
import type { OrderForm } from "@rarible/tezos-sdk/dist/order"
import BigNumber from "bignumber.js"
import type { CancelOrderRequest, ICancel } from "../../types/order/cancel/domain"
import type { ITezosAPI, MaybeProvider } from "./common"
import {
	covertToLibAsset,
	getRequiredProvider,
	getTezosOrderId,
} from "./common"

export class TezosCancel {
	constructor(
		private provider: MaybeProvider<TezosProvider>,
		private apis: ITezosAPI,
		private network: TezosNetwork,
	) {}

	cancel: ICancel = Action.create({
		id: "send-tx" as const,
		run: async (request: CancelOrderRequest) => {
			const order = await this.apis.order.getOrderByHash({
				hash: getTezosOrderId(request.orderId),
			})

			const orderForm: OrderForm = {
				type: order.type,
				maker: order.maker,
				maker_edpk: order.makerEdpk,
				taker: order.taker,
				taker_edpk: order.takerEdpk,
				make: covertToLibAsset(order.make),
				take: covertToLibAsset(order.take),
				salt: order.salt,
				start: order.start,
				end: order.end,
				signature: order.signature,
				data: {
					data_type: "V1",
					payouts: order.data.payouts?.map(payout => ({
						account: payout.account,
						value: new BigNumber(payout.value),
					})),
					origin_fees: order.data.originFees?.map(fee => ({
						account: fee.account,
						value: new BigNumber(fee.value),
					})),
				},
			}

			const tx = await cancel(
				getRequiredProvider(this.provider),
				orderForm,
				false
			)

			return new BlockchainTezosTransaction(tx, this.network)
		},
	})
}
