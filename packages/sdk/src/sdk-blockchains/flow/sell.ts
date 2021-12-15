import { toBigNumber, toOrderId } from "@rarible/types"
import type { FlowSdk } from "@rarible/flow-sdk"
import { toFlowItemId } from "@rarible/flow-sdk"
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

	constructor(private readonly sdk: FlowSdk, private readonly apis: IApisSdk) {
		this.sell = this.sell.bind(this)
		this.update = this.update.bind(this)
	}

	async getPreparedOrder(request: OrderId): Promise<Order> {
		return this.apis.order.getOrderById({ id: request })
	}

	getFlowProtocolFee() {
		return parseInt(this.sdk.order.getProtocolFee().sellerFee.value)
	}

	async sell(request: OrderCommon.PrepareOrderInternalRequest): Promise<OrderCommon.PrepareOrderInternalResponse> {
		const contract = getFlowCollection(request.collectionId)
		const sellAction = Action.create({
			id: "send-tx" as const,
			run: async (sellRequest: OrderCommon.OrderInternalRequest) => {
				if (sellRequest.currency["@type"] === "FLOW_FT") {
					const currency = getFungibleTokenName(sellRequest.currency.contract)
					const { itemId } = parseUnionItemId(sellRequest.itemId)
					return this.sdk.order.sell({
						collection: contract,
						currency,
						itemId: toFlowItemId(`${contract}:${itemId}`),
						sellItemPrice: toBn(sellRequest.price).decimalPlaces(8).toString(),
					})
				}
				throw new Error(`Unsupported currency type: ${sellRequest.currency["@type"]}`)
			},
		}).after((tx) => toOrderId(`FLOW:${tx.orderId}`))


		return {
			multiple: false,
			supportedCurrencies: FlowSell.supportedCurrencies,
			baseFee: this.getFlowProtocolFee(),
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
						return await this.sdk.order.updateOrder({
							collection: getFlowCollection(order.make.type.contract),
							currency,
							order: parseInt(orderId),
							sellItemPrice: toBigNumber(toBn(sellRequest.price).decimalPlaces(8).toString()),
						})
					}
					throw new Error(`Unsupported make asset: ${order.make.type["@type"]}`)
				}
				throw new Error(`Unsupported take asset: ${order.take.type["@type"]}`)
			},
		}).after((tx) => toOrderId(`FLOW:${tx.orderId}`))


		return {
			supportedCurrencies: FlowSell.supportedCurrencies,
			originFeeSupport: OriginFeeSupport.NONE,
			payoutsSupport: PayoutsSupport.NONE,
			baseFee: this.getFlowProtocolFee(),
			submit: sellAction,
		}
	}
}
