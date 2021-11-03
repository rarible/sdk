import { FlowWallet } from "@rarible/sdk-wallet"
import { toBigNumber } from "@rarible/types/build/big-number"
import { FlowSdk } from "@rarible/flow-sdk"
import { Action } from "@rarible/action"
import { Order } from "@rarible/api-client"
import { BlockchainFlowTransaction } from "@rarible/sdk-transaction"
import {
	FillRequest,
	OriginFeeSupport,
	PayoutsSupport,
	PrepareFillRequest,
	PrepareFillResponse,
} from "../../types/order/fill/domain"
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
			// todo replace this api call for call from flow-sdk when it supported
			return api(this.wallet.network).orderController.getOrderById({ id: request.orderId })
		} else {
			throw new Error("Incorrect request")
		}
	}

	getFlowContract(order: Order): string {
		if (order.make.type["@type"] === "FLOW_NFT") {
			return order.make.type.contract
		}
		throw Error("This is not FLOW order")
	}

	getFlowCurrency(order: Order) {
		if (order.take.type["@type"] === "FLOW_FT") {
			return getFungibleTokenName(order.take.type.contract)
		}
		throw Error("Invalid order take asset")
	}

	async buy(request: PrepareFillRequest): Promise<PrepareFillResponse> {
		const order = await this.getPreparedOrder(request)
		const buyAction = Action.create({
			id: "send-tx" as const,
			run: async (buyRequest: FillRequest) => {
				const currency = this.getFlowCurrency(order)
				const owner = parseFlowMaker(order.maker)
				const collectionId = getFlowCollection(this.getFlowContract(order))
				const orderId = parseInt(parseOrderId(order.id))//todo leave string when support it on flow-sdk transactions
				return this.sdk.order.buy(collectionId, currency, orderId, owner)
			},
		}).after((tx) => {
			return new BlockchainFlowTransaction(tx)
		})

		return {
			multiple: false,
			maxAmount: toBigNumber("1"),
			baseFee: 250,
			supportsPartialFill: false,
			originFeeSupport: OriginFeeSupport.NONE, //todo not supported on flow yet
			payoutsSupport: PayoutsSupport.NONE, //todo not supported on flow yet
			submit: buyAction,
		}
	}
}
