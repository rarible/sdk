import type { Ethereum } from "@rarible/ethereum-provider"
import type { BigNumberValue } from "@rarible/utils"
import { toBn } from "@rarible/utils"
import type { BigNumber } from "@rarible/types"
import { toAddress } from "@rarible/types"
import type { Address, Part } from "@rarible/ethereum-api-client"
import { toBigNumber } from "@rarible/types/build/big-number"
import type { SendFunction } from "../../../common/send-transaction"
import type { SimpleSeaportV1Order } from "../../types"
import type { OrderFillSendData } from "../types"
import { ExchangeWrapperOrderType } from "../types"
import type { PreparedOrderRequestDataForExchangeWrapper } from "../types"
import { createExchangeWrapperContract } from "../../contracts/exchange-wrapper"
import { calcValueWithFees, originFeeValueConvert } from "../common/origin-fees-utils"
import { createSeaportV14Contract } from "../../contracts/seaport-v14"
import type { InputCriteria } from "./types"
import {
	CROSS_CHAIN_SEAPORT_ADDRESS,
	CROSS_CHAIN_SEAPORT_V1_4_ADDRESS,
	KNOWN_CONDUIT_KEYS_TO_CONDUIT,
	NO_CONDUIT,
} from "./constants"
import { convertAPIOrderToSeaport } from "./convert-to-seaport-order"
import { getBalancesAndApprovals } from "./balance-and-approval-check"
import { getOrderHash } from "./get-order-hash"
import { validateAndSanitizeFromOrderStatus } from "./fulfill"
import { getFulfillAdvancedOrderData } from "./fulfill-advance"
import type { OrderStatus } from "./types"

export async function fulfillOrderWithWrapper(
	ethereum: Ethereum,
	send: SendFunction,
	simpleOrder: SimpleSeaportV1Order,
	{ unitsToFill, seaportWrapper, originFees }: {
		unitsToFill?: BigNumberValue,
		seaportWrapper: Address,
		originFees?: Part[]
	}
): Promise<OrderFillSendData> {
	const { totalFeeBasisPoints, encodedFeesValue, feeAddresses } = originFeeValueConvert(originFees)

	const preparedData = await prepareSeaportExchangeData(
		ethereum,
		send,
		simpleOrder,
		{
			unitsToFill,
			encodedFeesValue,
			totalFeeBasisPoints,
		},
	)

	const seaportWrapperContract = createExchangeWrapperContract(ethereum, seaportWrapper)
	const functionCall = seaportWrapperContract.functionCall("singlePurchase", preparedData.data, feeAddresses[0], feeAddresses[1])
	return {
		functionCall,
		options: preparedData.options,
	}
}

export async function prepareSeaportExchangeData(
	ethereum: Ethereum,
	send: SendFunction,
	simpleOrder: SimpleSeaportV1Order,
	{
		unitsToFill,
		encodedFeesValue,
		totalFeeBasisPoints,
	}: {
		unitsToFill?: BigNumberValue
		// converted to single uint fee value, values should be in right order in case of use for batch purchase
		encodedFeesValue: BigNumber,
		totalFeeBasisPoints: number
	}
): Promise<PreparedOrderRequestDataForExchangeWrapper> {
	const seaportContract = createSeaportV14Contract(ethereum, toAddress(CROSS_CHAIN_SEAPORT_V1_4_ADDRESS))

	const order = convertAPIOrderToSeaport(simpleOrder)

	const fulfillerAddress = await ethereum.getFrom()
	const { parameters: orderParameters } = order
	const { offerer, offer, consideration } = orderParameters

	const offererOperator = (KNOWN_CONDUIT_KEYS_TO_CONDUIT as Record<string, string>)[orderParameters.conduitKey]

	const conduitKey = NO_CONDUIT
	const fulfillerOperator = KNOWN_CONDUIT_KEYS_TO_CONDUIT[conduitKey]

	const extraData = "0x"
	const recipientAddress = fulfillerAddress
	const offerCriteria: InputCriteria[] = []
	const considerationCriteria: InputCriteria[] = []

	const [
		offererBalancesAndApprovals,
		fulfillerBalancesAndApprovals,
		orderStatusRaw,
	] = await Promise.all([
		getBalancesAndApprovals({
			ethereum,
			owner: offerer,
			items: offer,
			criterias: offerCriteria,
			operator: offererOperator,
		}),
		getBalancesAndApprovals({
			ethereum,
			owner: fulfillerAddress,
			items: [...offer, ...consideration],
			criterias: [...offerCriteria, ...considerationCriteria],
			operator: fulfillerOperator,
		}),
		seaportContract.functionCall("getOrderStatus", getOrderHash(orderParameters)).call(),
	])

	const orderStatus: OrderStatus = {
		totalFilled: toBn(orderStatusRaw.totalFilled),
		totalSize: toBn(orderStatusRaw.totalSize),
		isValidated: orderStatusRaw.isValidated,
		isCancelled: orderStatusRaw.isCancelled,
	}

	const sanitizedOrder = validateAndSanitizeFromOrderStatus(
		order,
		orderStatus
	)

	const timeBasedItemParams = {
		startTime: sanitizedOrder.parameters.startTime,
		endTime: sanitizedOrder.parameters.endTime,
		currentBlockTimestamp: Math.floor(Date.now() / 1000),
		ascendingAmountTimestampBuffer: 300,
	}

	const fulfillOrdersData = await getFulfillAdvancedOrderData({
		ethereum,
		send,
		order: sanitizedOrder,
		unitsToFill,
		totalSize: orderStatus.totalSize,
		totalFilled: orderStatus.totalFilled,
		offerCriteria,
		considerationCriteria,
		tips: [],
		extraData,
		seaportAddress: toAddress(CROSS_CHAIN_SEAPORT_ADDRESS),
		offererBalancesAndApprovals,
		fulfillerBalancesAndApprovals,
		offererOperator,
		fulfillerOperator,
		timeBasedItemParams,
		conduitKey,
		recipientAddress,
	})

	const valueForSending = calcValueWithFees(toBigNumber(fulfillOrdersData.value), totalFeeBasisPoints)

	return {
		data: {
			marketId: ExchangeWrapperOrderType.SEAPORT_ADVANCED_ORDERS,
			amount: fulfillOrdersData.value,
			fees: encodedFeesValue,
			data: fulfillOrdersData.data,
		},
		options: {
			value: valueForSending.toString(),
		},
	}
}
