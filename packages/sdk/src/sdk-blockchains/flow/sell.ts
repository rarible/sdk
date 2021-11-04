import { toOrderId } from "@rarible/types"
import type { FlowSdk } from "@rarible/flow-sdk"
import { Action } from "@rarible/action"
import { toBn } from "@rarible/utils/build/bn"
import type { Order, OrderId } from "@rarible/api-client"
import type {
	OrderInternalRequest,
	OrderUpdateRequest,
	PrepareOrderInternalRequest,
	PrepareOrderInternalResponse,
	PrepareOrderUpdateRequest,
	PrepareOrderUpdateResponse,
} from "../../types/order/common"
import { OriginFeeSupport, PayoutsSupport } from "../../types/order/fill/domain"
import type { IApisSdk } from "../../domain"
import { getFungibleTokenName, parseUnionItemId } from "./common/converters"

export class FlowSell {
	constructor(private readonly  sdk: FlowSdk, private readonly apis: IApisSdk) {
		this.sell = this.sell.bind(this)
		this.update = this.update.bind(this)
	}

	async getPreparedOrder(request: OrderId): Promise<Order> {
		return this.apis.order.getOrderById({ id: request })
	}

	async sell(request: PrepareOrderInternalRequest): Promise<PrepareOrderInternalResponse> {
		const [blockchain, contract] = request.collectionId.split(":")
		if (blockchain !== "FLOW") {
			throw new Error("Not an flow item")
		}
		const sellAction = Action.create({
			id: "send-tx" as const,
			run: async (sellRequest: OrderInternalRequest) => {
				if (sellRequest.currency["@type"] === "FLOW_FT") {
					const currency = getFungibleTokenName(sellRequest.currency.contract)
					const { itemId } = parseUnionItemId(sellRequest.itemId)
					return await this.sdk.order.sell(
						contract,
						currency,
						parseInt(itemId), //todo leave string when support it on flow-sdk transactions
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
			supportedCurrencies: [
				{ blockchain: "FLOW", type: "NATIVE" },
			],
			baseFee: 250,
			originFeeSupport: OriginFeeSupport.NONE,
			payoutsSupport: PayoutsSupport.NONE,
			submit: sellAction,
		}
	}

	async update(request: PrepareOrderUpdateRequest): Promise<PrepareOrderUpdateResponse> {
		const [blockchain, orderId] = request.orderId.split(":")
		if (blockchain !== "FLOW") {
			throw new Error("Not an flow order")
		}
		const order = await this.getPreparedOrder(request.orderId)
		const sellAction = Action.create({
			id: "send-tx" as const,
			run: async (sellRequest: OrderUpdateRequest) => {
				if (order.make.type["@type"] === "FLOW_FT") {
					const currency = getFungibleTokenName(order.make.type.contract)
					return await this.sdk.order.updateOrder(
						order.make.type.contract,
						currency,
						parseInt(orderId), //todo leave string when support it on flow-sdk transactions
						toBn(sellRequest.price).decimalPlaces(8).toString(),
					)
				}
				throw new Error(`Unsupported currency: ${order.make.type["@type"]}`)
			},
		}).after((tx) => {
			const orderId = tx.events.find(e => {
				const eventType = e.type.split(".")[3]
				return eventType === "OrderAvailable"
			})
			if (orderId) {
				if (order.make.type["@type"] === "FLOW_FT") {
					return toOrderId(`FLOW:${orderId.data.orderId}`)
				}
				throw new Error(`Unsupported currency: ${order.make.type["@type"]}`)
			}
			throw new Error("Creation order event not fount in transaction result")
		})


		return {
			supportedCurrencies: [
				{ blockchain: "FLOW", type: "NATIVE" },
			],
			originFeeSupport: OriginFeeSupport.NONE,
			payoutsSupport: PayoutsSupport.NONE,
			baseFee: 250,
			submit: sellAction,
		}
	}
}
