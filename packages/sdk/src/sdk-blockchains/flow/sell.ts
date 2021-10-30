import { FlowWallet } from "@rarible/sdk-wallet"
import { toBigNumber } from "@rarible/types/build/big-number"
import { toOrderId } from "@rarible/types"
import { FlowSdk } from "@rarible/flow-sdk"
import { Action } from "@rarible/action"
import { toBn } from "@rarible/utils/build/bn"
import { OrderRequest, PrepareOrderRequest, PrepareOrderResponse } from "../../order/common"
import { parseUnionItemId } from "./common/converters"

export class FlowSell {
	constructor(private sdk: FlowSdk, private wallet: FlowWallet) {
		this.sell = this.sell.bind(this)
	}

	async sell(request: PrepareOrderRequest): Promise<PrepareOrderResponse> {

		const sellAction = Action.create({
			id: "send-tx" as const,
			run: async (sellRequest: OrderRequest) => {
				if (sellRequest.currency["@type"] === "FLOW_FT") {
					const currency = "FLOW" //todo
					const { collectionId, itemId } = parseUnionItemId(request.itemId)
					return await this.sdk.order.sell(
						collectionId,
						currency,
						parseInt(itemId), //todo leave string when support it on flow-sdk transactions
						toBn(sellRequest.price).decimalPlaces(8).toString(),
					)
				}
				throw Error(`Unsupported currency: ${sellRequest.currency["@type"]}`)
			},
		}).after((tx) => {
			const orderId = tx.events.find(e => {
				const eventType = e.type.split(".")[3]
				return eventType === "OrderAvailable"
			})
			if (orderId) {
				const { collectionId } = parseUnionItemId(request.itemId)
				return toOrderId(`FLOW:${collectionId}:${orderId.data.orderId}`)
			}
			throw Error("Creation order event not fount in transaction result")
		})


		return {
			multiple: false,
			supportedCurrencies: [
				{ blockchain: "FLOW", type: "NATIVE" },
			],
			maxAmount: toBigNumber("1"),
			baseFee: 0, //todo
			submit: sellAction,
		}
	}
}
