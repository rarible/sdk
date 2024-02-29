import type { Address } from "@rarible/ethereum-api-client"
import type { Ethereum, EthereumSendOptions } from "@rarible/ethereum-provider"
import { toBigNumber, toBinary, ZERO_ADDRESS } from "@rarible/types"
import { toBn } from "@rarible/utils"
import type { Maybe } from "@rarible/types/build/maybe"
import { approve } from "../approve"
import type { SendFunction } from "../../common/send-transaction"
import type { SimpleLegacyOrder } from "../types"
import { getAssetWithFee } from "../get-asset-with-fee"
import { createExchangeV1Contract } from "../contracts/exchange-v1"
import { toLegacyAssetType } from "../to-legacy-asset-type"
import { toVrs } from "../../common/to-vrs"
import type { GetConfigByChainId } from "../../config"
import type { ApiService } from "../../common/apis"
import type { BaseFeeService } from "../../common/base-fee"
import { getRequiredWallet } from "../../common/get-required-wallet"
import { invertOrder } from "./invert-order"
import type { LegacyOrderFillRequest, OrderFillSendData, OrderHandler } from "./types"
import { ConfigService } from "../../common/config"

export class RaribleV1OrderHandler implements OrderHandler<LegacyOrderFillRequest> {

	constructor(
		private readonly configService: ConfigService,
		private readonly apiService: ApiService,
		private readonly send: SendFunction,
		private readonly getConfig: GetConfigByChainId,
		private readonly baseFeeService: BaseFeeService,
	) {}

	invert(request: LegacyOrderFillRequest, maker: Address): SimpleLegacyOrder {
		const inverted = invertOrder(request.order, request.amount, maker)
		inverted.data = {
			dataType: "LEGACY",
			fee: request.originFee,
		}
		return inverted
	}

	async approve(order: SimpleLegacyOrder, infinite: boolean): Promise<void> {
		const wallet = this.configService.getRequiredWallet()
		const withFee = getAssetWithFee(order.make, this.getOrderFee(order))
		const approveTx = await approve(wallet, this.send, () => this.getConfig(), order.maker, withFee, infinite)
	}

	async getBaseOrderFee(): Promise<number> {
		// const
		return this.baseFeeService.getBaseFee("RARIBLE_V1")
	}

	getOrderFee(order: SimpleLegacyOrder): number {
		return order.data.fee
	}

	async getTransactionData(
		initial: SimpleLegacyOrder,
		inverted: SimpleLegacyOrder,
		request: LegacyOrderFillRequest
	): Promise<OrderFillSendData> {
		const wallet = getRequiredWallet(this.ethereum)
		const apis = await this.apiService.byCurrentWallet()
		if (!initial.end) {
			throw new Error("Expiration date is required")
		}
		const buyerFeeSig = await apis.order.buyerFeeSignature(
			{
				fee: inverted.data.fee,
				orderForm: {
					...initial,
					salt: toBigNumber(toBn(initial.salt).toString()),
					signature: initial.signature ?? toBinary("0x"),
					end: initial.end,
				},
			},
		)
		const config = await this.getConfig()
		const exchangeContract = createExchangeV1Contract(wallet, config.exchange.v1)
		const functionCall = exchangeContract.functionCall(
			"exchange",
			toStructLegacyOrder(initial),
			toVrs(initial.signature!),
			inverted.data.fee,
			toVrs(buyerFeeSig),
			inverted.take.value,
			request.payout ?? ZERO_ADDRESS,
		)
		const options = getMatchV1Options(inverted)

		return {
			functionCall,
			options,
		}
	}
}

function getMatchV1Options(order: SimpleLegacyOrder): EthereumSendOptions {
	if (order.make.assetType.assetClass === "ETH") {
		const makeAsset = getAssetWithFee(order.make, order.data.fee)
		return { value: makeAsset.value }
	} else {
		return {}
	}
}

export function toStructLegacyOrder(order: SimpleLegacyOrder) {
	if (order.type !== "RARIBLE_V1") {
		throw new Error(`Not supported type: ${order.type}`)
	}
	const data = order.data
	if (data.dataType !== "LEGACY") {
		throw new Error(`Not supported data type: ${data.dataType}`)
	}
	return {
		key: toStructLegacyOrderKey(order),
		selling: order.make.value,
		buying: order.take.value,
		sellerFee: data.fee,
	}
}

export function toStructLegacyOrderKey(order: SimpleLegacyOrder) {
	return {
		owner: order.maker,
		salt: order.salt,
		sellAsset: toLegacyAssetType(order.make.assetType),
		buyAsset: toLegacyAssetType(order.take.assetType),
	}
}
