import { FlowWallet } from "@rarible/sdk-wallet"
import { toBigNumber } from "@rarible/types/build/big-number"
import { FlowSdk } from "@rarible/flow-sdk"
import { Action } from "@rarible/action"
import { Blockchain, Order } from "@rarible/api-client"
import {
	FillActionTypes,
	FillRequest,
	OriginFeeSupport,
	PayoutsSupport,
	PrepareFillRequest,
	PrepareFillResponse,
} from "../../order/fill/domain"
import { getFlowCollection, getFungibleTokenName, parseFlowMaker, parseOrderId } from "./common/converters"
import { api } from "./common/api"

export class FlowBuy {
	constructor(private sdk: FlowSdk, private wallet: FlowWallet) {
		this.buy = this.buy.bind(this)
	}

	async getPreparedOrder(request: PrepareFillRequest): Promise<Order> {
		if ("order" in request) {
			return request.order
		} else if ("orderId" in request) {
			//todo maybe add retry
			return await api(this.wallet.network).orderController.getOrderById({ id: request.orderId })
		} else {
			throw new Error("Incorrect request")
		}
	}

	getFlowContract(order: Order): string {
		if (order.make.type["@type"] !== "FLOW_NFT") {
			throw Error("This is not FLOW order")
		}
		return order.make.type.contract
	}

	getFlowCurrency(order: Order) {
		if (order.take.type["@type"] === "FLOW_FT") {
			return getFungibleTokenName(order.take.type.contract)
		}
		throw Error("Invalid order take asset")
	}

	private action: FillActionTypes = "send-tx"

	async buy(request: PrepareFillRequest): Promise<PrepareFillResponse> {
		const order = await this.getPreparedOrder(request)
		const buyAction = Action.create({
			id: this.action,
			run: async (buyRequest: FillRequest) => {
				const currency = this.getFlowCurrency(order)
				const owner = parseFlowMaker(order.maker)
				const collectionId = getFlowCollection(this.getFlowContract(order))
				const orderId = parseOrderId(order.id)
				return await this.sdk.order.buy(collectionId, currency, orderId, owner)
			},
		}).after((tx) => {
			const blockchain: Blockchain = "FLOW"
			return {
				blockchain,
				transaction: tx,
				async wait() {
					return {
						blockchain,
						hash: tx.txId,
					}
				},
			}
		})

		return {
			maxAmount: toBigNumber("1"),
			baseFee: 0, //todo
			supportsPartialFill: false,
			originFeeSupport: OriginFeeSupport.NONE, //todo
			payoutsSupport: PayoutsSupport.NONE, //todo
			submit: buyAction,
		}
	}
}
