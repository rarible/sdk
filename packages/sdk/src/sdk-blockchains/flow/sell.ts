import { FlowWallet } from "@rarible/sdk-wallet"
import { toBigNumber } from "@rarible/types/build/big-number"
import { toOrderId } from "@rarible/types"
import { FlowSdk } from "@rarible/flow-sdk"
import { Action } from "@rarible/action"
import type { PrepareSellRequest, PrepareSellResponse } from "../../order/sell/domain"
import { SellRequest } from "../../order/sell/domain"
import { parseUnionItemId } from "./common/converters"

export class FlowSell {
	constructor(private sdk: FlowSdk, private wallet: FlowWallet) {
		this.sell = this.sell.bind(this)
	}

	async sell(request: PrepareSellRequest): Promise<PrepareSellResponse> {

		const sellAction = Action.create({
			id: "send-tx" as const,
			run: async (sellRequest: SellRequest) => {
				if (sellRequest.currency["@type"] === "FLOW_FT") {
					const currency = "FLOW" //todo
					const { collectionId, itemId } = parseUnionItemId(request.itemId)
					return await this.sdk.order.sell(
						collectionId,
						currency,
						parseInt(itemId), //todo leave string when support it on flow-sdk transactions
						sellRequest.price
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
				return toOrderId(`FLOW:${orderId.data.orderId}`)
			}
			throw Error("Creation order event not fount in transaction result")
		})


		return {
			supportedCurrencies: [
				{ blockchain: "FLOW", type: "NATIVE" },
			],
			maxAmount: toBigNumber("1"),
			baseFee: 0, //todo
			submit: sellAction,
		}
	}
}
