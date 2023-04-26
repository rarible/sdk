import type { Maybe } from "@rarible/types/build/maybe"
import type { Ethereum } from "@rarible/ethereum-provider"
import type { EthereumTransaction } from "@rarible/ethereum-provider"
import type { BigNumber } from "@rarible/types"
import { toBigNumber, ZERO_ADDRESS } from "@rarible/types"
import type { Part } from "@rarible/ethereum-api-client"
import type { SimpleOrder, SimpleX2Y2Order } from "../types"
import type { SendFunction } from "../../common/send-transaction"
import type { EthereumConfig } from "../../config/type"
import { createExchangeWrapperContract } from "../contracts/exchange-wrapper"
import type { RaribleEthereumApis } from "../../common/apis"
import type { PreparedOrderRequestDataForExchangeWrapper, X2Y2OrderFillRequest } from "./types"
import { ExchangeWrapperOrderType } from "./types"
import type { OrderFillSendData } from "./types"
import { X2Y2Utils } from "./x2y2-utils/get-order-sign"
import { calcValueWithFees, originFeeValueConvert } from "./common/origin-fees-utils"

export class X2Y2OrderHandler {
	constructor(
		private readonly ethereum: Maybe<Ethereum>,
		private readonly send: SendFunction,
		private readonly config: EthereumConfig,
		private readonly getBaseOrderFeeConfig: (type: SimpleOrder["type"]) => Promise<number>,
		private readonly apis: RaribleEthereumApis,
	) {}

	async fillOrder(order: SimpleX2Y2Order, request: X2Y2OrderFillRequest): Promise<EthereumTransaction> {
		const sendData = await this.getTransactionData(request)

		return this.send(
			sendData.functionCall,
			sendData.options
		)
	}

	async getTransactionData(request: X2Y2OrderFillRequest): Promise<OrderFillSendData> {
		if (!this.ethereum) {
			throw new Error("Wallet undefined")
		}

		const wrapper = createExchangeWrapperContract(this.ethereum, this.config.exchange.wrapper)

		if (!request.order.data?.orderId) {
			throw new Error("No x2y2 orderId provided")
		}

		if (request.originFees && request.originFees.length > 1) {
			throw new Error("x2y2 supports max up to 2 origin fee value")
		}

		const { totalFeeBasisPoints, encodedFeesValue, feeAddresses } = originFeeValueConvert(request.originFees)
		const valueForSending = calcValueWithFees(toBigNumber(request.order.take.value), totalFeeBasisPoints)

		const data = await this.getWrapperData(
			request,
			encodedFeesValue,
			valueForSending.toFixed()
		)

		const functionCall = wrapper.functionCall("singlePurchase", data.data, feeAddresses[0], feeAddresses[1])

		return {
			functionCall,
			options: data.options,
		}
	}

	async getTransactionDataForExchangeWrapper(
		request: X2Y2OrderFillRequest,
		originFees: Part[] | undefined,
		feeValue: BigNumber,
	): Promise<PreparedOrderRequestDataForExchangeWrapper> {
		const { totalFeeBasisPoints } = originFeeValueConvert(originFees)
		const valueForSending = calcValueWithFees(toBigNumber(request.order.take.value), totalFeeBasisPoints)

		return this.getWrapperData(
			request,
			feeValue,
			valueForSending.toFixed()
		)
	}

	private async getWrapperData(
		request: X2Y2OrderFillRequest,
		feeValue: BigNumber,
		totalValueForSending: string
	) {
		if (!this.ethereum) {
			throw new Error("Wallet undefined")
		}

		const x2y2Input = await X2Y2Utils.getOrderSign(this.apis, {
			sender: this.config.exchange.wrapper,
			orderId: request.order.data.orderId,
			currency: ZERO_ADDRESS,
			price: request.order.take.value,
		})

		return {
			data: {
				marketId: ExchangeWrapperOrderType.X2Y2,
				amount: request.order.take.value,
				fees: feeValue,
				data: x2y2Input,
			},
			options: { value: totalValueForSending },
		}
	}

	getBaseOrderFee() {
		return this.getBaseOrderFeeConfig("X2Y2")
	}

	getOrderFee(): number {
		return 0
	}
}
