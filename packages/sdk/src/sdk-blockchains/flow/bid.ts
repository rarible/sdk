import { toContractAddress, toFlowContractAddress, toOrderId } from "@rarible/types"
import type { FlowSdk } from "@rarible/flow-sdk"
import { Action } from "@rarible/action"
import { toFlowItemId } from "@rarible/flow-sdk/build/common/item"
import { toBigNumber } from "@rarible/types/build/big-number"
import { Blockchain } from "@rarible/api-client"
import { OriginFeeSupport, PayoutsSupport } from "../../types/order/fill/domain"
import type * as OrderCommon from "../../types/order/common"
import type { CurrencyType } from "../../common/domain"
import { getFungibleTokenName } from "./common/converters"

export class FlowBid {
	static supportedCurrencies: CurrencyType[] = [{
		blockchain: Blockchain.FLOW,
		type: "NATIVE",
	}]

	constructor(private sdk: FlowSdk) {
		this.bid = this.bid.bind(this)
		this.update = this.update.bind(this)
	}

	async bid(prepare: OrderCommon.PrepareOrderRequest): Promise<OrderCommon.PrepareOrderResponse> {
		if (!prepare.itemId) {
			throw new Error("ItemId has not been specified")
		}

		const [domain, contract, tokenId] = prepare.itemId.split(":")
		if (domain !== "FLOW") {
			throw new Error(`Not an flow item: ${prepare.itemId}`)
		}
		const itemId = toFlowItemId(`${contract}:${tokenId}`)

		const bidAction = Action.create({
			id: "send-tx" as const,
			run: async (bidRequest: OrderCommon.OrderRequest) => {
				if (bidRequest.currency["@type"] === "FLOW_FT") {
					const currency = getFungibleTokenName(bidRequest.currency.contract)
					return this.sdk.order.bid(
						toFlowContractAddress(contract),
						currency,
						itemId,
						toBigNumber(bidRequest.price.toString()),
					)
				}
				throw new Error(`Unsupported currency type: ${bidRequest.currency["@type"]}`)
			},
		}).after((tx) => toOrderId(`FLOW:${tx.orderId}`))

		return {
			originFeeSupport: OriginFeeSupport.NONE,
			payoutsSupport: PayoutsSupport.NONE,
			supportedCurrencies: FlowBid.supportedCurrencies,
			multiple: false,
			maxAmount: toBigNumber("1"),
			baseFee: 250, //todo get from flow-sdk
			submit: bidAction,
		}
	}

	async update(
		prepareRequest: OrderCommon.PrepareOrderUpdateRequest,
	): Promise<OrderCommon.PrepareOrderUpdateResponse> {
		if (!prepareRequest.orderId) {
			throw new Error("OrderId has not been specified")
		}
		const [blockchain, orderId] = prepareRequest.orderId.split(":")
		if (blockchain !== "FLOW") {
			throw new Error("Not an flow order")
		}
		const order = await this.sdk.apis.order.getOrderByOrderId({ orderId })

		const bidUpdateAction = Action.create({
			id: "send-tx" as const,
			run: async (bidRequest: OrderCommon.OrderUpdateRequest) => {
				if (order.make["@type"] === "fungible") {
					const currency = getFungibleTokenName(toContractAddress(`FLOW:${order.make.contract}`))
					return this.sdk.order.bidUpdate(
						order.take.contract,
						currency,
						order,
						toBigNumber(bidRequest.price.toString()),
					)
				}
				throw new Error(`Unsupported currency type: ${order.make["@type"]}`)
			},
		}).after((tx) => toOrderId(`FLOW:${tx.orderId}`))

		return {
			originFeeSupport: OriginFeeSupport.NONE,
			payoutsSupport: PayoutsSupport.NONE,
			supportedCurrencies: FlowBid.supportedCurrencies,
			baseFee: 250,
			submit: bidUpdateAction,
		}
	}
}
