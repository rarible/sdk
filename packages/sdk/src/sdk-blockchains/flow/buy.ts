import type { FlowWallet } from "@rarible/sdk-wallet"
import { toBigNumber } from "@rarible/types/build/big-number"
import type { FlowSdk } from "@rarible/flow-sdk"
import { Action } from "@rarible/action"
import type { Order } from "@rarible/api-client"
import { BlockchainFlowTransaction } from "@rarible/sdk-transaction"
import {
	FillRequest,
	OriginFeeSupport,
	PayoutsSupport,
	PrepareFillRequest,
	PrepareFillResponse,
} from "../../types/order/fill/domain"
import {
	getFlowCollection,
	getFungibleTokenName,
	parseFlowAddressFromUnionAddress,
	parseOrderId,
} from "./common/converters"
import { api } from "./common/api"

export class FlowBuy {
	constructor(private sdk: FlowSdk, private wallet: FlowWallet) {
		this.buy = this.buy.bind(this)
	}

	async getPreparedOrder(request: PrepareFillRequest): Promise<Order> {
		if ("order" in request) {
			return request.order
		}
		if ("orderId" in request) {
			// todo replace this api call for call from flow-sdk when it supported
			return api(this.wallet.network).orderController.getOrderById({ id: request.orderId })
		}
		throw new Error("Incorrect request")
	}

	getFlowContract(order: Order): string {
		if (order.make.type["@type"] === "FLOW_NFT") {
			return order.make.type.contract
		}
		throw new Error("This is not FLOW order")
	}

	getFlowCurrency(order: Order) {
		if (order.take.type["@type"] === "FLOW_FT") {
			return getFungibleTokenName(order.take.type.contract)
		}
		throw new Error("Invalid order take asset")
	}

	async buy(request: PrepareFillRequest): Promise<PrepareFillResponse> {
		const order = await this.getPreparedOrder(request)
		const submit = Action
			.create({
				id: "send-tx" as const,
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				run: (buyRequest: FillRequest) => {
					const currency = this.getFlowCurrency(order)
					const owner = parseFlowAddressFromUnionAddress(order.maker)
					const collectionId = getFlowCollection(this.getFlowContract(order))
					// @todo leave string when support it on flow-sdk transactions
					const orderId = parseInt(parseOrderId(order.id))
					return this.sdk.order.buy(collectionId, currency, orderId, owner)
				},
			})
			.after(tx => new BlockchainFlowTransaction(tx))

		return {
			multiple: false,
			maxAmount: toBigNumber("1"),
			baseFee: 250,
			supportsPartialFill: false,
			// @todo not supported on flow yet
			originFeeSupport: OriginFeeSupport.NONE,
			payoutsSupport: PayoutsSupport.NONE,
			submit,
		}
	}
}
