import type { Ethereum } from "@rarible/ethereum-provider"
import type { BigNumberValue } from "@rarible/utils"
import { toBn } from "@rarible/utils"
import type { BigNumber } from "@rarible/types"
import { toAddress } from "@rarible/types"
import type { Address } from "@rarible/ethereum-api-client"
import { toBigNumber } from "@rarible/types/build/big-number"
import type { SendFunction } from "../../../common/send-transaction"
import type { SimpleSeaportV1Order } from "../../types"
import { ExchangeWrapperOrderType } from "../types"
import type { PreparedOrderRequestDataForExchangeWrapper } from "../types"
import { calcValueWithFees } from "../common/origin-fees-utils"
import { compareCaseInsensitive } from "../../../common/compare-case-insensitive"
import { isETH } from "../../../nft/common"
import type { InputCriteria } from "./types"
import {
	CROSS_CHAIN_SEAPORT_ADDRESS, CROSS_CHAIN_SEAPORT_V1_4_ADDRESS, CROSS_CHAIN_SEAPORT_V1_5_ADDRESS,
	getConduitByKey, NO_CONDUIT,
} from "./constants"
import { convertAPIOrderToSeaport } from "./convert-to-seaport-order"
import { getBalancesAndApprovals } from "./balance-and-approval-check"
import { getOrderHash } from "./get-order-hash"
import { validateAndSanitizeFromOrderStatus } from "./fulfill"
import { getFulfillAdvancedOrderWrapperData } from "./fulfill-advance-wrapper"
import type { OrderStatus } from "./types"
import { getSeaportContract } from "./seaport-utils"

export async function prepareSeaportExchangeData(
	ethereum: Ethereum,
	send: SendFunction,
	simpleOrder: SimpleSeaportV1Order,
	// seaportContract: EthereumContract,
	{
		unitsToFill,
		encodedFeesValue,
		totalFeeBasisPoints,
	}: {
		unitsToFill?: BigNumberValue
		// converted to single uint fee value, values should be in right order in case of use for batch purchase
		encodedFeesValue: BigNumber,
		totalFeeBasisPoints: number,
	}
): Promise<PreparedOrderRequestDataForExchangeWrapper> {
	const seaportContract = getSeaportContract(ethereum, toAddress(simpleOrder.data.protocol))
	const order = convertAPIOrderToSeaport(simpleOrder)

	const fulfillerAddress = await ethereum.getFrom()
	const { parameters: orderParameters } = order
	const { offerer, offer, consideration } = orderParameters

	// const conduitKey = OPENSEA_CONDUIT_KEY
	const conduitKey = NO_CONDUIT
	const offererOperator = getConduitByKey(orderParameters.conduitKey, simpleOrder.data.protocol)
	// const offererOperator = wrapperAddress
	const fulfillerOperator = getConduitByKey(conduitKey, simpleOrder.data.protocol)
	// const fulfillerOperator = wrapperAddress

	const extraData = "0x"
	const recipientAddress = fulfillerAddress
	const offerCriteria: InputCriteria[] = []
	const considerationCriteria: InputCriteria[] = []

	const [
		offererBalancesAndApprovals,
		fulfillerBalancesAndApprovals,
		orderStatusRaw,
	] = await Promise.all([
		//check item owner balances
		getBalancesAndApprovals({
			ethereum,
			owner: offerer,
			items: offer,
			criterias: offerCriteria,
			operator: offererOperator,
		}),
		//check buyer balances
		getBalancesAndApprovals({
			ethereum,
			owner: fulfillerAddress,
			items: [...offer, ...consideration],
			criterias: [...offerCriteria, ...considerationCriteria],
			operator: fulfillerOperator,
			// operator: wrapperAddress,
		}),
		seaportContract.functionCall("getOrderStatus", getOrderHash(orderParameters)).call(),
	])
	console.log(
		"offererBalancesAndApprovals",
		JSON.stringify(offererBalancesAndApprovals, null, "	"),
		offererBalancesAndApprovals
	)
	console.log(
		"fulfillerBalancesAndApprovals",
		JSON.stringify(fulfillerBalancesAndApprovals, null, "	"),
		fulfillerBalancesAndApprovals
	)

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

	const fulfillOrdersData = await getFulfillAdvancedOrderWrapperData({
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
		seaportContract,
	})

	const valueForSending = calcValueWithFees(toBigNumber(fulfillOrdersData.value), totalFeeBasisPoints)
	const totalPrice = toBn(simpleOrder.take.value)
		.div(simpleOrder.make.value)
		.multipliedBy(unitsToFill || 1)
		.toFixed()

	return {
		data: {
			marketId: getMarketIdByOpenseaContract(simpleOrder.data.protocol),
			amount: toBn(totalPrice).toFixed(),
			fees: encodedFeesValue,
			data: fulfillOrdersData.data,
		},
		options: {
			value: isETH(simpleOrder.take.assetType) ? valueForSending.toString() : "0",
		},
	}
}

export function getMarketIdByOpenseaContract(contract: Address) {
	if (compareCaseInsensitive(contract, CROSS_CHAIN_SEAPORT_V1_4_ADDRESS)) {
		return ExchangeWrapperOrderType.SEAPORT_V14
	} else if (compareCaseInsensitive(contract, CROSS_CHAIN_SEAPORT_ADDRESS)) {
		return ExchangeWrapperOrderType.SEAPORT_ADVANCED_ORDERS
	} else if (compareCaseInsensitive(contract, CROSS_CHAIN_SEAPORT_V1_5_ADDRESS)) {
		return ExchangeWrapperOrderType.SEAPORT_V15
	}
	throw new Error("Unrecognized opensea protocol contract")
}
