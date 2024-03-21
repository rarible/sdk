import type { Maybe } from "@rarible/types/build/maybe"
import type { Ethereum, EthereumTransaction } from "@rarible/ethereum-provider"
import { SeaportOrderType } from "@rarible/ethereum-api-client/build/models/SeaportOrderType"
import { SeaportItemType } from "@rarible/ethereum-api-client/build/models/SeaportItemType"
import type { BigNumber } from "@rarible/types"
import { toBigNumber, ZERO_ADDRESS } from "@rarible/types"
import type { Asset, Part } from "@rarible/ethereum-api-client"
import { toBn } from "@rarible/utils/build/bn"
import type { AssetType } from "@rarible/ethereum-api-client/build/models/AssetType"
import { BigNumber as BigNumberUtils } from "@rarible/utils"
import axios from "axios"
import { isNft } from "../is-nft"
import type { SimpleOrder } from "../types"
import type { SendFunction } from "../../common/send-transaction"
import type { EthereumNetwork } from "../../types"
import type { IRaribleEthereumSdkConfig } from "../../types"
import { getRequiredWallet } from "../../common/get-required-wallet"
import type { RaribleEthereumApis } from "../../common/apis"
import { isWeth } from "../../nft/common"
import type { GetConfigByChainId } from "../../config"
import { ItemType, OrderType } from "./seaport-utils/constants"
import type { PreparedOrderRequestDataForExchangeWrapper, SeaportV1OrderFillRequest } from "./types"
import type { TipInputItem } from "./seaport-utils/types"
import { prepareSeaportExchangeData } from "./seaport-utils/seaport-wrapper-utils"
import { fulfillOrder } from "./seaport-utils/seaport-utils"
import type { OrderFillSendData } from "./types"
import { calcValueWithFees, originFeeValueConvert, setFeesCurrency } from "./common/origin-fees-utils"
import type { ComplexFeesReducedData } from "./common/origin-fee-reducer"

export class SeaportOrderHandler {
	constructor(
		private readonly ethereum: Maybe<Ethereum>,
		private readonly send: SendFunction,
		private readonly getConfig: GetConfigByChainId,
		private readonly getApis: () => Promise<RaribleEthereumApis>,
		private readonly getBaseOrderFeeConfig: (type: SimpleOrder["type"]) => Promise<number>,
		private readonly env: EthereumNetwork,
		private readonly sdkConfig?: IRaribleEthereumSdkConfig,
	) {
	}

	async sendTransaction(
		request: SeaportV1OrderFillRequest,
	): Promise<EthereumTransaction> {
		const { functionCall, options } = await this.getTransactionData(request)
		return this.send(
			functionCall,
			options,
		)
	}

	async getSignature({ hash, protocol } : {hash: string, protocol: string}): Promise<any> {
		try {
			const apis = await this.getApis()
			const { signature } = await apis.orderSignature.getSeaportOrderSignature({
				hash: hash,
			})
			return signature
		} catch (e: any) {
			const inactiveMsg = "Error when generating fulfillment data"
			const msg = e?.value?.message || e?.data?.message
			if (typeof msg === "string" && msg.includes(inactiveMsg)) {
				throw new Error("Order is not active or cancelled")
			}
			if (this.env === "testnet" || this.env === "mumbai") {
				try {
					const orderData = {
						listing: {
							hash: hash,
							chain: this.env === "testnet" ? "goerli" : "mumbai",
							protocol_address: protocol,
						},
						fulfiller: {
							address: await this.ethereum?.getFrom(),
						},
					}
					const { data } = await axios.post("https://testnets-api.opensea.io/v2/listings/fulfillment_data", orderData)
					return data.fulfillment_data.orders[0].signature
				} catch (e: any) {
					console.error(e)
					if (Array.isArray(e?.response?.data?.errors)) {
						throw new Error(e?.response?.data?.errors.join(","))
					}
					throw e
				}
			}

			throw new Error(`api.getSeaportOrderSignature error: ${e}, hash=${hash}`)
		}
	}
	async getTransactionData(
		request: SeaportV1OrderFillRequest,
		requestOptions?: { disableCheckingBalances?: boolean },
	): Promise<OrderFillSendData> {
		const ethereum = getRequiredWallet(this.ethereum)
		const { order } = request
		if (order.start === undefined || order.end === undefined) {
			throw new Error("Order should includes start/end fields")
		}

		const { unitsToFill, takeIsNft } = getUnitsToFill(request)

		let tips: TipInputItem[] | undefined = []
		if (!takeIsNft) {
			tips = this.convertOriginFeesToTips(request)
		}

		if (!order.signature || order.signature === "0x") {
			if (!request.order.hash) {
				throw new Error("getSeaportOrderSignature error: order.hash does not exist")
			}

			order.signature = await this.getSignature({
				hash: request.order.hash,
				protocol: request.order.data.protocol,
			})
			if (!order.signature) {
				throw new Error("Can't fetch Seaport order signature")
			}
		}
		const { functionCall, options } = await fulfillOrder(
			ethereum,
			this.send.bind(this),
			order,
			{
				unitsToFill,
				tips,
				disableCheckingBalances: requestOptions?.disableCheckingBalances,
			},
		)

		return {
			functionCall,
			options,
		}
	}

	convertOriginFeesToTips(request: SeaportV1OrderFillRequest): TipInputItem[] | undefined {
		const { make } = request.order
		const feeBase = make.assetType.assetClass === "ERC1155" && !toBn(request.amount).isEqualTo(make.value)
			? toBn(request.order.take.value).div(make.value).multipliedBy(request.amount)
			: toBn(request.order.take.value)
		return request.originFees?.map(fee => ({
			token: getSeaportToken(request.order.take.assetType),
			amount: feeBase
				.multipliedBy(toBn(fee.value))
				.dividedBy(10000)
				.integerValue(BigNumberUtils.ROUND_FLOOR)
				.toFixed(),
			recipient: fee.account,
		}))
	}

	async getTransactionDataForExchangeWrapper(
		request: SeaportV1OrderFillRequest,
		originFees: Part[] | undefined,
		feeValue: BigNumber,
		options?: { disableCheckingBalances?: boolean },
	): Promise<PreparedOrderRequestDataForExchangeWrapper> {
		if (!this.ethereum) {
			throw new Error("Wallet undefined")
		}
		const config = await this.getConfig()
		const { unitsToFill } = getUnitsToFill(request)

		const { totalFeeBasisPoints } = originFeeValueConvert(originFees)

		if (!request.order.signature || request.order.signature === "0x") {
			request.order.signature = await this.getSignature({
				hash: request.order.hash,
				protocol: request.order.data.protocol,
			})
			if (!request.order.signature) {
				throw new Error("Can't fetch Seaport order signature")
			}
		}

		if (!config.exchange.wrapper) {
			throw new Error("Exchange wrapper is not defined for Seaport tx")
		}

		const takeAssetType = request.order.take.assetType
		let feeValueWithCurrency = feeValue
		if (isWeth(takeAssetType, config)) {
			feeValueWithCurrency = setFeesCurrency(feeValueWithCurrency, true)
		}

		return prepareSeaportExchangeData(
			this.ethereum,
			this.send.bind(this),
			request.order,
			{
				unitsToFill: unitsToFill,
				encodedFeesValue: feeValueWithCurrency,
				totalFeeBasisPoints: totalFeeBasisPoints,
				disableCheckingBalances: options?.disableCheckingBalances,
			},
		)
	}

	getAssetToApprove(
		request: SeaportV1OrderFillRequest, feesData: ComplexFeesReducedData
	): Asset {
		const { make, take } = request.order
		const totalPrice = toBn(take.value)
			.div(make.value)
			.multipliedBy(request.amount)

		let valueWithOriginFees = calcValueWithFees(totalPrice, feesData.totalFeeBasisPoints)

		return {
			assetType: take.assetType,
			value: toBigNumber(valueWithOriginFees.toFixed()),
		}
	}

	getBaseOrderFee() {
		return this.getBaseOrderFeeConfig("SEAPORT_V1")
	}

	getOrderFee(): number {
		return 0
	}
}

function getUnitsToFill(request: SeaportV1OrderFillRequest): {
	unitsToFill: number | undefined,
	takeIsNft: boolean,
} {
	const takeIsNft = isNft(request.order.take.assetType)
	const makeIsNft = isNft(request.order.make.assetType)
	const unitsToFill =
		request.order.make.assetType.assetClass === "ERC1155" || request.order.take.assetType.assetClass === "ERC1155" ?
			request.amount : undefined
	const isSupportedPartialFill = request.order.data.orderType === "PARTIAL_RESTRICTED" ||
		request.order.data.orderType === "PARTIAL_OPEN"

	let isPartialFill: boolean
	if (takeIsNft) {
		isPartialFill = unitsToFill ? unitsToFill.toString() !== request.order.take.value.toString() : false
	} else if (makeIsNft) {
		isPartialFill = unitsToFill ? unitsToFill.toString() !== request.order.make.value.toString() : false
	} else {
		throw new Error("Make/take asset in order is non-nft asset")
	}

	if (!isSupportedPartialFill && isPartialFill) {
		throw new Error("Order is not supported partial fill")
	}

	return {
		unitsToFill,
		takeIsNft,
	}
}

export function convertOrderType(type: SeaportOrderType): OrderType {
	switch (type) {
		case SeaportOrderType.FULL_OPEN: return OrderType.FULL_OPEN
		case SeaportOrderType.PARTIAL_OPEN: return OrderType.PARTIAL_OPEN
		case SeaportOrderType.FULL_RESTRICTED: return OrderType.FULL_RESTRICTED
		case SeaportOrderType.PARTIAL_RESTRICTED: return OrderType.PARTIAL_RESTRICTED
		default: throw new Error(`Unrecognized order type=${type}`)
	}
}

export function convertItemType(type: SeaportItemType): ItemType {
	switch (type) {
		case SeaportItemType.NATIVE: return ItemType.NATIVE
		case SeaportItemType.ERC20: return ItemType.ERC20
		case SeaportItemType.ERC721: return ItemType.ERC721
		case SeaportItemType.ERC721_WITH_CRITERIA: return ItemType.ERC721_WITH_CRITERIA
		case SeaportItemType.ERC1155: return ItemType.ERC1155
		case SeaportItemType.ERC1155_WITH_CRITERIA: return ItemType.ERC1155_WITH_CRITERIA
		default: throw new Error(`Unrecognized item type=${type}`)
	}
}

export function getSeaportToken(assetType: AssetType): string {
	switch (assetType.assetClass) {
		case "ETH": return ZERO_ADDRESS
		case "ERC20": return assetType.contract
		default: throw new Error("Asset type should be currency token")
	}
}
