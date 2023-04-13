import type { Address } from "@rarible/ethereum-api-client"
import type {
	Ethereum,
	EthereumFunctionCall,
	EthereumSendOptions,
	EthereumTransaction,
} from "@rarible/ethereum-provider"
import { ZERO_ADDRESS, ZERO_WORD } from "@rarible/types"
import type { Maybe } from "@rarible/types/build/maybe"
import { hashToSign, orderToStruct, signOrder } from "../sign-order"
import { getAssetWithFee } from "../get-asset-with-fee"
import type { EthereumConfig } from "../../config/type"
import { approve } from "../approve"
import type { SendFunction } from "../../common/send-transaction"
import { createExchangeV2Contract } from "../contracts/exchange-v2"
import { waitTx } from "../../common/wait-tx"
import type { SimpleOrder, SimpleRaribleV2Order } from "../types"
import { isSigner } from "../../common/is-signer"
import { fixSignature } from "../../common/fix-signature"
import type { IRaribleEthereumSdkConfig } from "../../types"
import { assetTypeToStruct } from "../asset-type-to-struct"
import { encodeRaribleV2OrderData } from "../encode-rarible-v2-order-data"
import { encodeRaribleV2OrderPurchaseStruct } from "./rarible-v2/encode-rarible-v2-order"
import { invertOrder } from "./invert-order"
import type {
	OrderFillSendData,
	OrderHandler,
	PreparedOrderRequestDataForExchangeWrapper,
	RaribleV2OrderFillRequest,
	RaribleV2OrderFillRequestV2,
	RaribleV2OrderFillRequestV3Buy,
	RaribleV2OrderFillRequestV3Sell,
} from "./types"
import { ExchangeWrapperOrderType } from "./types"
import { ZERO_FEE_VALUE } from "./common/origin-fees-utils"

export class RaribleV2OrderHandler implements OrderHandler<RaribleV2OrderFillRequest> {

	constructor(
		private readonly ethereum: Maybe<Ethereum>,
		private readonly send: SendFunction,
		private readonly config: EthereumConfig,
		private readonly getBaseOrderFeeConfig: (type: SimpleOrder["type"]) => Promise<number>,
		private readonly sdkConfig?: IRaribleEthereumSdkConfig
	) { }

	invert(request: RaribleV2OrderFillRequest, maker: Address): SimpleRaribleV2Order {
		const inverted = invertOrder(request.order, request.amount, maker)
		switch (request.order.data.dataType) {
			case "RARIBLE_V2_DATA_V1": {
				inverted.data = {
					dataType: "RARIBLE_V2_DATA_V1",
					originFees: (request as RaribleV2OrderFillRequestV2).originFees || [],
					payouts: (request as RaribleV2OrderFillRequestV2).payouts || [],
				}
				break
			}
			case "RARIBLE_V2_DATA_V2": {
				inverted.data = {
					dataType: "RARIBLE_V2_DATA_V2",
					originFees: (request as RaribleV2OrderFillRequestV2).originFees || [],
					payouts: (request as RaribleV2OrderFillRequestV2).payouts || [],
					isMakeFill: !request.order.data.isMakeFill,
				}
				break
			}
			case "RARIBLE_V2_DATA_V3_BUY": {
				inverted.data = {
					dataType: "RARIBLE_V2_DATA_V3_SELL",
					payout: (request as RaribleV2OrderFillRequestV3Sell).payout,
					originFeeFirst: (request as RaribleV2OrderFillRequestV3Sell).originFeeFirst,
					originFeeSecond: (request as RaribleV2OrderFillRequestV3Sell).originFeeSecond,
					maxFeesBasePoint: (request as RaribleV2OrderFillRequestV3Sell).maxFeesBasePoint,
					marketplaceMarker: (request as RaribleV2OrderFillRequestV3Sell).marketplaceMarker,
				}
				break
			}
			case "RARIBLE_V2_DATA_V3_SELL": {
				inverted.data = {
					dataType: "RARIBLE_V2_DATA_V3_BUY",
					payout: (request as RaribleV2OrderFillRequestV3Buy).payout,
					originFeeFirst: (request as RaribleV2OrderFillRequestV3Buy).originFeeFirst,
					originFeeSecond: (request as RaribleV2OrderFillRequestV3Buy).originFeeSecond,
					marketplaceMarker: (request as RaribleV2OrderFillRequestV3Buy).marketplaceMarker,
				}
				break
			}
			default: throw new Error("Unsupported order dataType")
		}
		return inverted
	}

	async approve(order: SimpleRaribleV2Order, infinite: boolean): Promise<void> {
		if (!this.ethereum) {
			throw new Error("Wallet undefined")
		}
		const withFee = await this.getMakeAssetWithFee(order)
		await waitTx(approve(this.ethereum, this.send, this.config.transferProxies, order.maker, withFee, infinite))
	}

	async getTransactionData(
		initial: SimpleRaribleV2Order, inverted: SimpleRaribleV2Order
	): Promise<OrderFillSendData> {
		if (!this.ethereum) {
			throw new Error("Wallet undefined")
		}
		const exchangeContract = createExchangeV2Contract(this.ethereum, this.config.exchange.v2)

		if (isSellOrder(initial)) {
			const nftStruct = assetTypeToStruct(this.ethereum, initial.make.assetType)
			const [sellOrderDataType, sellOrderData] = encodeRaribleV2OrderData(this.ethereum, initial.data)
			const [, buyOrderData] = encodeRaribleV2OrderData(this.ethereum, inverted.data)

			const functionCall = exchangeContract.functionCall(
				"directPurchase",
				{
					sellOrderMaker: initial.maker,
					sellOrderNftAmount: initial.make.value,
					nftAssetClass: nftStruct.assetClass,
					nftData: nftStruct.data,
					sellOrderPaymentAmount: initial.take.value,
					paymentToken: initial.take.assetType.assetClass === "ETH" ? ZERO_ADDRESS : initial.take.assetType.contract,
					sellOrderSalt: initial.salt,
					sellOrderStart: initial.start ?? 0,
					sellOrderEnd: initial.end ?? 0,
					sellOrderDataType: sellOrderDataType,
					sellOrderData: sellOrderData,
					sellOrderSignature: fixSignature(initial.signature) || "0x",
					buyOrderPaymentAmount: inverted.make.value,
					buyOrderNftAmount: inverted.take.value,
					buyOrderData: buyOrderData,
				}
			)
			const options = await this.getMatchV2Options(initial, inverted)

			return {
				functionCall,
				options,
			}
		} else {
			let functionCall: EthereumFunctionCall
			if (isCollectionOrder(initial)) {
				functionCall = exchangeContract.functionCall(
					"matchOrders",
					await this.fixForTx(initial),
					fixSignature(initial.signature) || "0x",
					orderToStruct(this.ethereum, inverted),
					fixSignature(inverted.signature) || "0x",
				)
			} else {
				const nftStruct = assetTypeToStruct(this.ethereum, initial.take.assetType)
				const [, sellOrderData] = encodeRaribleV2OrderData(this.ethereum, inverted.data)
				const [buyOrderDataType, buyOrderData] = encodeRaribleV2OrderData(this.ethereum, initial.data)

				functionCall = exchangeContract.functionCall(
					"directAcceptBid",
					{
						bidMaker: initial.maker,
						bidNftAmount: initial.take.value,
						nftAssetClass: nftStruct.assetClass,
						nftData: nftStruct.data,
						bidPaymentAmount: initial.make.value,
						paymentToken: initial.make.assetType.assetClass === "ETH" ? ZERO_ADDRESS : initial.make.assetType.contract,
						bidSalt: initial.salt,
						bidStart: initial.start ?? 0,
						bidEnd: initial.end ?? 0,
						bidDataType: buyOrderDataType,
						bidData: buyOrderData,
						bidSignature: fixSignature(initial.signature) || "0x",
						sellOrderPaymentAmount: inverted.take.value,
						sellOrderNftAmount: inverted.make.value,
						sellOrderData: sellOrderData,
					}
				)
			}
			const options = await this.getMatchV2Options(initial, inverted)

			return {
				functionCall,
				options,
			}
		}
	}

	async getTransactionDataForExchangeWrapper(
		initial: SimpleRaribleV2Order,
		inverted: SimpleRaribleV2Order
	): Promise<PreparedOrderRequestDataForExchangeWrapper> {
		if (!this.ethereum) {
			throw new Error("Wallet undefined")
		}
		if (initial.take.assetType.assetClass !== "ETH") {
			throw new Error("Batch purchase only available for ETH currency")
		}
		if (!initial.signature) {
			initial.signature = await signOrder(this.ethereum, this.config, initial)
		}

		// fix payouts to send bought item to buyer
		if (inverted.data.dataType === "RARIBLE_V2_DATA_V1" || inverted.data.dataType === "RARIBLE_V2_DATA_V2") {
			if (!inverted.data.payouts?.length) {
				inverted.data.payouts = [{
					account: inverted.maker,
					value: 10000,
				}]
			}
		} else if (
			inverted.data.dataType === "RARIBLE_V2_DATA_V3_BUY" ||
			inverted.data.dataType === "RARIBLE_V2_DATA_V3_SELL"
		) {
			if (!inverted.data.payout) {
				inverted.data.payout = {
					account: inverted.maker,
					value: 10000,
				}
			}
		}

		const signature = fixSignature(initial.signature) || "0x"
		const callData = encodeRaribleV2OrderPurchaseStruct(
			this.ethereum,
			initial,
			signature,
			inverted,
			true
		)
		const options = await this.getMatchV2Options(initial, inverted)
		return {
			data: {
				marketId: ExchangeWrapperOrderType.RARIBLE_V2,
				amount: options?.value!,
				fees: ZERO_FEE_VALUE, // using zero fee because fees already included in callData
				data: callData,
			},
			options,
		}
	}

	async fixForTx(order: SimpleRaribleV2Order): Promise<any> {
		if (!this.ethereum) {
			throw new Error("Wallet undefined")
		}
		const hash = hashToSign(this.config, this.ethereum, order)
		const isMakerSigner = await isSigner(this.ethereum, order.maker, hash, order.signature!)
		return orderToStruct(this.ethereum, order, !isMakerSigner)
	}

	async getMatchV2Options(
		left: SimpleRaribleV2Order, right: SimpleRaribleV2Order,
	): Promise<EthereumSendOptions> {
		if (left.make.assetType.assetClass === "ETH" && left.salt === ZERO_WORD) {
			const asset = await this.getMakeAssetWithFee(left)
			return { value: asset.value }
		} else if (right.make.assetType.assetClass === "ETH" && right.salt === ZERO_WORD) {
			const asset = await this.getMakeAssetWithFee(right)
			return { value: asset.value }
		} else {
			return {}
		}
	}

	async getMakeAssetWithFee(order: SimpleRaribleV2Order) {
		return getAssetWithFee(order.make, await this.getOrderFee(order))
	}

	async getOrderFee(order: SimpleRaribleV2Order): Promise<number> {
		switch (order.data.dataType) {
			case "RARIBLE_V2_DATA_V1":
			case "RARIBLE_V2_DATA_V2":
				return order.data.originFees.map(f => f.value).reduce((v, acc) => v + acc, 0) + await this.getBaseOrderFee()
			case "RARIBLE_V2_DATA_V3_BUY":
			case "RARIBLE_V2_DATA_V3_SELL":
				return (order.data.originFeeFirst?.value ?? 0) +
					(order.data.originFeeSecond?.value ?? 0) +
					await this.getBaseOrderFee()
			default:
				throw new Error("Unsupported order dataType")
		}
	}

	async getBaseOrderFee(): Promise<number> {
		return this.getBaseOrderFeeConfig("RARIBLE_V2")
	}
}

/**
 * Check if order selling something for currency
 */
function isSellOrder(order: SimpleOrder): boolean {
	return order.take.assetType.assetClass === "ETH" || order.take.assetType.assetClass === "ERC20"
}

function isCollectionOrder(order: SimpleOrder): boolean {
	return order.take.assetType.assetClass === "COLLECTION"
}
