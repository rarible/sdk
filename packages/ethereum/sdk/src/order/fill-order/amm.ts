import type { Maybe } from "@rarible/types/build/maybe"
import type { Ethereum, EthereumTransaction } from "@rarible/ethereum-provider"
import type { BigNumber } from "@rarible/types"
import { toBigNumber } from "@rarible/types/build/big-number"
import { toBn } from "@rarible/utils/build/bn"
import type { SendFunction } from "../../common/send-transaction"
import type { EthereumConfig } from "../../config/type"
import { getRequiredWallet } from "../../common/get-required-wallet"
import type { SimpleOrder } from "../types"
import type { EthereumNetwork, IRaribleEthereumSdkConfig } from "../../types"
import { createExchangeWrapperContract } from "../contracts/exchange-wrapper"
import type { RaribleEthereumApis } from "../../common/apis"
import type { OrderFillSendData, AmmOrderFillRequest } from "./types"
import { SudoswapFill } from "./amm/sudoswap-fill"
import type { PreparedOrderRequestDataForExchangeWrapper } from "./types"
import {
	calcValueWithFees,
	encodeBasisPointsPlusAccount,
	getPackedFeeValue,
	originFeeValueConvert,
} from "./common/origin-fees-utils"
import { ExchangeWrapperOrderType } from "./types"

export class AmmOrderHandler {
	constructor(
		private readonly ethereum: Maybe<Ethereum>,
		private readonly send: SendFunction,
		private readonly config: EthereumConfig,
		private readonly getBaseOrderFeeConfig: (type: SimpleOrder["type"]) => Promise<number>,
		private readonly apis: RaribleEthereumApis,
		private readonly env: EthereumNetwork,
		private readonly sdkConfig?: IRaribleEthereumSdkConfig,
		private readonly options: {directBuy: boolean} = { directBuy: false },
	) {}

	private async getMarketData(
		request: AmmOrderFillRequest,
		fillData: OrderFillSendData,
		feeValue?: BigNumber,
	) {
		const ethereum = getRequiredWallet(this.ethereum)

		const { totalFeeBasisPoints, encodedFeesValue, feeAddresses } = originFeeValueConvert(request.originFees)
		let valueForSending = calcValueWithFees(toBigNumber(fillData.options.value?.toString() ?? "0"), totalFeeBasisPoints)

		const data = {
			marketId: ExchangeWrapperOrderType.AAM,
			amount: fillData.options.value ?? "0",
			fees: feeValue ?? encodedFeesValue,
			data: await fillData.functionCall.getData(),
		}
		if (request.addRoyalty && request.assetType) {
			const royalties = await this.apis.nftItem.getNftItemRoyaltyById({
				itemId: `${request.assetType.contract}:${request.assetType.tokenId}`,
			})

			if (royalties.royalty?.length) {
				const dataForEncoding = {
					data: await fillData.functionCall.getData(),
					additionalRoyalties: royalties.royalty.map(
						royalty => encodeBasisPointsPlusAccount(royalty.value, royalty.account)
					),
				}
				data.data = ethereum.encodeParameter(ADDITIONAL_DATA_STRUCT, dataForEncoding)

				const royaltiesAmount = SudoswapFill.getRoyaltiesAmount(
					royalties.royalty,
					fillData.options.value?.toString() ?? 0
				)
				valueForSending = toBn(valueForSending.plus(royaltiesAmount).toString())

				if (feeValue) {
					data.fees = toBigNumber("0x1" + feeValue.toString().slice(-8))
				} else {
					const firstFee = getPackedFeeValue(request.originFees?.[0]?.value)
					const secondFee = getPackedFeeValue(request.originFees?.[1]?.value)
					if (firstFee.length > 4 || secondFee.length > 4) {
						throw new Error("Decrease origin fees values")
					}
					data.fees = toBigNumber("0x1" + firstFee + secondFee)
				}
			}
		}

		return {
			originFees: {
				totalFeeBasisPoints,
				encodedFeesValue,
				feeAddresses,
			},
			data,
			options: {
				...fillData.options,
				value: valueForSending.toString(),
			},
		}
	}

	async getTransactionData(request: AmmOrderFillRequest): Promise<OrderFillSendData> {
		const ethereum = getRequiredWallet(this.ethereum)
		const fillData = await this.getTransactionDataDirectBuy(request)

		if (this.options.directBuy) { // direct buy with sudoswap contract
			if (request.originFees?.length) {
				throw new Error("Origin fees not supported for sudoswap direct buy")
			}

			return {
				functionCall: fillData.functionCall,
				options: fillData.options,
			}
		} else { // buy with rarible wrapper
			const wrapperContract = createExchangeWrapperContract(ethereum, this.config.exchange.wrapper)

			const { data, options, originFees: { feeAddresses } } = await this.getMarketData(request, fillData)
			const functionCall = wrapperContract.functionCall(
				"singlePurchase",
				data,
				feeAddresses[0],
				feeAddresses[1]
			)

			return {
				functionCall: functionCall,
				options,
			}
		}
	}

	private async getTransactionDataDirectBuy(request: AmmOrderFillRequest): Promise<OrderFillSendData> {
		const ethereum = getRequiredWallet(this.ethereum)

		let fillData: OrderFillSendData
		switch (request.order.data.dataType) {
			case "SUDOSWAP_AMM_DATA_V1":
				fillData = await SudoswapFill.getDirectFillData(ethereum, request, this.apis, this.config, this.sdkConfig)
				break
			default:
				throw new Error("Unsupported order data type " + request.order.data.dataType)
		}

		return {
			functionCall: fillData.functionCall,
			options: fillData.options,
		}
	}

	async sendTransaction(request: AmmOrderFillRequest): Promise<EthereumTransaction> {
		const { functionCall, options } = await this.getTransactionData(request)
		return this.send(functionCall, options)
	}

	async getTransactionDataForExchangeWrapper(
		request: AmmOrderFillRequest,
		feeValue: BigNumber,
	): Promise<PreparedOrderRequestDataForExchangeWrapper> {
		if (request.order.take.assetType.assetClass !== "ETH") {
			throw new Error("Unsupported asset type for take asset " + request.order.take.assetType.assetClass)
		}

		const fillData = await this.getTransactionDataDirectBuy(request)
		const { data, options } = await this.getMarketData(request, fillData, feeValue)

		return {
			data,
			options,
		}
	}

	getBaseOrderFee() {
		return this.getBaseOrderFeeConfig("AMM")
	}

	getOrderFee(): number {
		return 0
	}
}

export const ADDITIONAL_DATA_STRUCT = {
	components: [
		{
			name: "data",
			type: "bytes",
		},
		{
			name: "additionalRoyalties",
			type: "uint[]",
		},
	],
	name: "data",
	type: "tuple",
}
