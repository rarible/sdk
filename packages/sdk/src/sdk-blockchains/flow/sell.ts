import { toBigNumber } from "@rarible/types"
import type { FlowSdk } from "@rarible/flow-sdk"
import { toFlowItemId } from "@rarible/flow-sdk"
import { Action } from "@rarible/action"
import { toBn } from "@rarible/utils/build/bn"
import type { Order, OrderId } from "@rarible/api-client"
import { Blockchain } from "@rarible/api-client"
import type * as OrderCommon from "../../types/order/common"
import type { CurrencyType } from "../../common/domain"
import { MaxFeesBasePointSupport, OriginFeeSupport, PayoutsSupport } from "../../types/order/fill/domain"
import type { IApisSdk } from "../../domain"
import { getCurrencyAssetType } from "../../common/get-currency-asset-type"
import type { PrepareSellInternalResponse } from "../../types/order/sell/domain"
import {
	convertFlowOrderId,
	getFlowCollection,
	getFungibleTokenName,
	parseFlowItemIdFromUnionItemId,
	toFlowParts,
} from "./common/converters"
import { getFlowBaseFee } from "./common/get-flow-base-fee"

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

	async sell(): Promise<PrepareSellInternalResponse> {
		const sellAction = Action.create({
			id: "send-tx" as const,
			run: async (sellRequest: OrderCommon.OrderInternalRequest) => {
				const requestCurrency = getCurrencyAssetType(sellRequest.currency)
				if (requestCurrency["@type"] === "FLOW_FT") {
					const currency = getFungibleTokenName(requestCurrency.contract)
					const {
						itemId,
						contract,
					} = parseFlowItemIdFromUnionItemId(sellRequest.itemId)
					return this.sdk.order.sell({
						collection: contract,
						currency,
						itemId: toFlowItemId(`${contract}:${itemId}`),
						sellItemPrice: toBn(sellRequest.price).decimalPlaces(8).toString(),
						originFees: toFlowParts(sellRequest.originFees),
					})

				}
				throw new Error(`Unsupported currency type: ${requestCurrency["@type"]}`)
			},
		}).after((tx) => convertFlowOrderId(tx.orderId))


		return {
			supportedCurrencies: FlowSell.supportedCurrencies,
			baseFee: getFlowBaseFee(this.sdk),
			originFeeSupport: OriginFeeSupport.FULL,
			payoutsSupport: PayoutsSupport.NONE,
			maxFeesBasePointSupport: MaxFeesBasePointSupport.IGNORED,
			supportsExpirationDate: false,
			submit: sellAction,
		}
	}

	async update(request: OrderCommon.PrepareOrderUpdateRequest): Promise<OrderCommon.PrepareOrderUpdateResponse> {
		const [blockchain, orderId] = request.orderId.split(":")
		if (blockchain !== Blockchain.FLOW) {
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
		}).after((tx) => convertFlowOrderId(tx.orderId))


		return {
			supportedCurrencies: FlowSell.supportedCurrencies,
			originFeeSupport: OriginFeeSupport.FULL,
			payoutsSupport: PayoutsSupport.NONE,
			maxFeesBasePointSupport: MaxFeesBasePointSupport.IGNORED,
			baseFee: getFlowBaseFee(this.sdk),
			submit: sellAction,
		}
	}
}
