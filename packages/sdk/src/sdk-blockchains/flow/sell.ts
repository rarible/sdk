import { FlowWallet } from "@rarible/sdk-wallet"
import { toBigNumber } from "@rarible/types/build/big-number"
import { toOrderId } from "@rarible/types"
import { FlowSdk } from "@rarible/flow-sdk"
import { Action } from "@rarible/action"
import type { PrepareSellRequest, PrepareSellResponse, SellActionTypes } from "../../order/sell/domain"
import { SellRequest } from "../../order/sell/domain"
import { parseUnionItemId } from "./common/converters"

export class FlowSell {
	constructor(private sdk: FlowSdk, private wallet: FlowWallet) {
		this.sell = this.sell.bind(this)
	}

	async sell(request: PrepareSellRequest): Promise<PrepareSellResponse> {
		const action: SellActionTypes = "send-tx"
		const sellAction = Action.create({
			id: action,
			run: async (sellRequest: SellRequest) => {
				if (sellRequest.currency["@type"] !== "FLOW_FT") {
					throw Error(`Unsupported currency: ${sellRequest.currency["@type"]}`)
				}
				const currency = "FLOW" //todo
				const { collectionId, flowItemId } = parseUnionItemId(request.itemId)
				return await this.sdk.order.sell(collectionId, currency, flowItemId, sellRequest.price)
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
