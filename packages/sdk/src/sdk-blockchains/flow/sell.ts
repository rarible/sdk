import { toOrderId } from "@rarible/types"
import type { FlowSdk } from "@rarible/flow-sdk"
import { Action } from "@rarible/action"
import { toBn } from "@rarible/utils/build/bn"
import type { Order, OrderId } from "@rarible/api-client"
import { Blockchain } from "@rarible/api-client"
import type * as OrderCommon from "../../types/order/common"
import type { CurrencyType } from "../../common/domain"
import { OriginFeeSupport, PayoutsSupport } from "../../types/order/fill/domain"
import type { IApisSdk } from "../../domain"
import { getFlowCollection, getFungibleTokenName, parseUnionItemId } from "./common/converters"

export class FlowSell {
	static supportedCurrencies: CurrencyType[] = [{
		blockchain: Blockchain.FLOW,
		type: "NATIVE",
	}]

	constructor(private readonly  sdk: FlowSdk, private readonly apis: IApisSdk) {
		this.sell = this.sell.bind(this)
		this.update = this.update.bind(this)
	}

	async getPreparedOrder(request: OrderId): Promise<Order> {
		return this.apis.order.getOrderById({ id: request })
	}

	async sell(request: OrderCommon.PrepareOrderInternalRequest): Promise<OrderCommon.PrepareOrderInternalResponse> {
		const contract = getFlowCollection(request.collectionId)
		const sellAction = Action.create({
			id: "send-tx" as const,
			run: async (sellRequest: OrderCommon.OrderInternalRequest) => {
				if (sellRequest.currency["@type"] === "FLOW_FT") {
					const currency = getFungibleTokenName(sellRequest.currency.contract)
					const { itemId } = parseUnionItemId(sellRequest.itemId)
					return this.sdk.order.sell(
						contract,
						currency,
						// @todo leave string when support it on flow-sdk transactions
						parseInt(itemId),
						toBn(sellRequest.price).decimalPlaces(8).toString(),
					)
				}
				throw new Error(`Unsupported currency type: ${sellRequest.currency["@type"]}`)
			},
		}).after((tx) => {
			const orderId = tx.events.find(e => {
				const eventType = e.type.split(".")[3]
				return eventType === "OrderAvailable"
			})
			if (orderId) {
				return toOrderId(`FLOW:${orderId.data.orderId}`)
			}
			throw new Error("Creation order event not fount in transaction result")
		})


		return {
			multiple: false,
			supportedCurrencies: FlowSell.supportedCurrencies,
			baseFee: 250,
			originFeeSupport: OriginFeeSupport.NONE,
			payoutsSupport: PayoutsSupport.NONE,
			submit: sellAction,
		}
	}

	async update(request: OrderCommon.PrepareOrderUpdateRequest): Promise<OrderCommon.PrepareOrderUpdateResponse> {
		const [blockchain, orderId] = request.orderId.split(":")
		if (blockchain !== "FLOW") {
			throw new Error("Not an flow order")
		}
		const order = await this.getPreparedOrder(request.orderId)
		const sellAction = Action.create({
			id: "send-tx" as const,
			run: async (sellRequest: OrderCommon.OrderUpdateRequest) => {
				if (order.take.type["@type"] === "FLOW_FT") {
					const currency = getFungibleTokenName(order.take.type.contract)
					if (order.make.type["@type"] === "FLOW_NFT") {
						return await this.sdk.order.updateOrder(
							getFlowCollection(order.make.type.contract),
							currency,
							// @todo leave string when support it on flow-sdk transactions
							parseInt(orderId),
							toBn(sellRequest.price).decimalPlaces(8).toString(),
						)
					}
					throw new Error(`Unsupported make asset: ${order.make.type["@type"]}`)
				}
				throw new Error(`Unsupported take asset: ${order.take.type["@type"]}`)
			},
		}).after((tx) => {
			const orderId = tx.events.find(e => {
				const eventType = e.type.split(".")[3]
				return eventType === "OrderAvailable"
			})
			if (orderId) {
				return toOrderId(`FLOW:${orderId.data.orderId}`)
			}
			throw new Error("Creation order event not fount in transaction result")
		})


		return {
			supportedCurrencies: FlowSell.supportedCurrencies,
			originFeeSupport: OriginFeeSupport.NONE,
			payoutsSupport: PayoutsSupport.NONE,
			baseFee: 250,
			submit: sellAction,
		}
	}
}
