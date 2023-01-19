import type { Maybe } from "@rarible/types/build/maybe"
import type { Ethereum, EthereumTransaction } from "@rarible/ethereum-provider"
import { SeaportOrderType } from "@rarible/ethereum-api-client/build/models/SeaportOrderType"
import { SeaportItemType } from "@rarible/ethereum-api-client/build/models/SeaportItemType"
import type { BigNumber } from "@rarible/types"
import { ZERO_ADDRESS } from "@rarible/types"
import type { Part } from "@rarible/ethereum-api-client"
import { toBn } from "@rarible/utils/build/bn"
import type { AssetType } from "@rarible/ethereum-api-client/build/models/AssetType"
import { BigNumber as BigNumberUtils } from "@rarible/utils"
import { isNft } from "../is-nft"
import type { SimpleOrder } from "../types"
import type { SendFunction } from "../../common/send-transaction"
import type { EthereumConfig } from "../../config/type"
import type { EthereumNetwork } from "../../types"
import type { IRaribleEthereumSdkConfig } from "../../types"
import { getRequiredWallet } from "../../common/get-required-wallet"
import { CROSS_CHAIN_SEAPORT_ADDRESS, ItemType, OrderType } from "./seaport-utils/constants"
import type { PreparedOrderRequestDataForExchangeWrapper, SeaportV1OrderFillRequest } from "./types"
import type { TipInputItem } from "./seaport-utils/types"
import { prepareSeaportExchangeData } from "./seaport-utils/seaport-wrapper-utils"
import { fulfillOrder } from "./seaport-utils/seaport-utils"
import type { OrderFillSendData } from "./types"
import { getUpdatedCalldata } from "./common/get-updated-call"
import { originFeeValueConvert } from "./common/origin-fees-utils"

export class SeaportOrderHandler {
	constructor(
		private readonly ethereum: Maybe<Ethereum>,
		private readonly send: SendFunction,
		private readonly config: EthereumConfig,
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

	async getTransactionData(
		request: SeaportV1OrderFillRequest,
	): Promise<OrderFillSendData> {
		const ethereum = getRequiredWallet(this.ethereum)
		const { order } = request
		if (order.data.protocol !== CROSS_CHAIN_SEAPORT_ADDRESS) {
			throw new Error("Unsupported protocol")
		}
		if (!order.signature) {
			throw new Error("Signature should exists")
		}
		if (order.start === undefined || order.end === undefined) {
			throw new Error("Order should includes start/end fields")
		}

		if (request.order.taker) {
			throw new Error("You can't fill private orders")
		}

		const { unitsToFill, takeIsNft } = getUnitsToFill(request)

		let tips: TipInputItem[] | undefined = []
		if (!takeIsNft) {
			tips = this.convertOriginFeesToTips(request)
		}
		const { functionCall, options } = await fulfillOrder(
			ethereum,
			this.send.bind(this),
			order,
			{
				unitsToFill,
				tips,
			},
		)

		return {
			functionCall,
			options: {
				...options,
				additionalData: getUpdatedCalldata(this.sdkConfig),
			},
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
				.toString(),
			recipient: fee.account,
		}))
	}

	async getTransactionDataForExchangeWrapper(
		request: SeaportV1OrderFillRequest,
		originFees: Part[] | undefined,
		feeValue: BigNumber,
	): Promise<PreparedOrderRequestDataForExchangeWrapper> {
		if (!this.ethereum) {
			throw new Error("Wallet undefined")
		}

		const { unitsToFill } = getUnitsToFill(request)

		const { totalFeeBasisPoints } = originFeeValueConvert(originFees)

		return prepareSeaportExchangeData(
			this.ethereum,
			this.send.bind(this),
			request.order,
			{
				unitsToFill: unitsToFill,
				encodedFeesValue: feeValue,
				totalFeeBasisPoints: totalFeeBasisPoints,
			},
		)
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
