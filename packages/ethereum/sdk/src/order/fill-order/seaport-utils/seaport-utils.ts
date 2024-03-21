import type { Ethereum, EthereumContract } from "@rarible/ethereum-provider"
import { toAddress, ZERO_ADDRESS } from "@rarible/types"
import type { BigNumberValue } from "@rarible/utils"
import type { BigNumber } from "@rarible/utils"
import { toBn } from "@rarible/utils"
import type { SimpleSeaportV1Order } from "../../types"
import type { SendFunction } from "../../../common/send-transaction"
import { createSeaportV14Contract } from "../../contracts/seaport-v14"
import { createSeaportContract } from "../../contracts/seaport"
import { compareCaseInsensitive } from "../../../common/compare-case-insensitive"
import { getOrderHash } from "./get-order-hash"
import type { BalancesAndApprovals } from "./balance-and-approval-check"
import {
	validateBasicFulfillBalancesAndApprovals, validateStandardFulfillBalancesAndApprovals,
} from "./balance-and-approval-check"
import { shouldUseBasicFulfill, validateAndSanitizeFromOrderStatus } from "./fulfill"
import type { Order } from "./types"
import type { ConsiderationItem } from "./types"
import type { InputCriteria, TipInputItem } from "./types"
import { getMaximumSizeForOrder } from "./item"
import type { TimeBasedItemParams } from "./item"
import {
	mapInputItemToOfferItem,
	mapOrderAmountsFromFilledStatus,
	mapOrderAmountsFromUnitsToFill,
} from "./order"
import { getBalancesAndApprovals } from "./balance-and-approval-check"
import { getfulfillBasicOrderData } from "./fulfill-basic"
import { getApprovalActions } from "./approval"
import { getFulfillStandardOrderData } from "./fulfill-standard"
import {
	CROSS_CHAIN_SEAPORT_ADDRESS,
	CROSS_CHAIN_SEAPORT_V1_4_ADDRESS,
	CROSS_CHAIN_SEAPORT_V1_5_ADDRESS,
	getConduitByKey, OPENSEA_CONDUIT_KEY,
} from "./constants"
import { convertAPIOrderToSeaport } from "./convert-to-seaport-order"

export function getSeaportContract(ethereum: Ethereum, protocol: string): EthereumContract {
	if (
		compareCaseInsensitive(protocol, CROSS_CHAIN_SEAPORT_V1_4_ADDRESS)
		|| compareCaseInsensitive(protocol, CROSS_CHAIN_SEAPORT_V1_5_ADDRESS)
	) {
	  return createSeaportV14Contract(ethereum, toAddress(protocol))
	} else if (compareCaseInsensitive(protocol, CROSS_CHAIN_SEAPORT_ADDRESS)) {
		return createSeaportContract(ethereum, toAddress(protocol))
	} else {
		throw new Error("Unrecognized Seaport protocol")
	}
}

export async function fulfillOrder(
	ethereum: Ethereum,
	send: SendFunction,
	simpleOrder: SimpleSeaportV1Order,
	{ tips, unitsToFill, disableCheckingBalances }: {
		tips?: TipInputItem[],
		unitsToFill?: BigNumberValue,
		disableCheckingBalances?: boolean
	}
) {
	const seaportContract = createSeaportV14Contract(ethereum, toAddress(simpleOrder.data.protocol))
	const order = convertAPIOrderToSeaport(simpleOrder)

	const { parameters: orderParameters } = order
	const { offerer, offer, consideration } = orderParameters
	const fulfillerAddress = await ethereum.getFrom()
	const conduitKey = OPENSEA_CONDUIT_KEY
	const offererOperator = getConduitByKey(orderParameters.conduitKey, simpleOrder.data.protocol)
	const fulfillerOperator = getConduitByKey(conduitKey, simpleOrder.data.protocol)

	const extraData = "0x"
	const recipientAddress = ZERO_ADDRESS
	const offerCriteria: InputCriteria[] = []
	const considerationCriteria: InputCriteria[] = []

	const [
		offererBalancesAndApprovals,
		fulfillerBalancesAndApprovals,
		orderStatus,
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

	const orderStatusData = { ...orderStatus }
	orderStatusData.totalFilled = toBn(orderStatus.totalFilled)
	orderStatusData.totalSize = toBn(orderStatus.totalSize)

	const { totalFilled, totalSize } = orderStatusData
	const sanitizedOrder = validateAndSanitizeFromOrderStatus(
		order,
		orderStatusData
	)

	const timeBasedItemParams = {
		startTime: sanitizedOrder.parameters.startTime,
		endTime: sanitizedOrder.parameters.endTime,
		currentBlockTimestamp: Math.floor(Date.now() / 1000),
		ascendingAmountTimestampBuffer: 300,
	}

	const tipConsiderationItems = tips?.map((tip) => ({
		...mapInputItemToOfferItem(tip),
		recipient: tip.recipient,
	})) || []

	const isRecipientSelf = recipientAddress === ZERO_ADDRESS

	// We use basic fulfills as they are more optimal for simple and "hot" use cases
	// We cannot use basic fulfill if user is trying to partially fill though.
	if (
		!unitsToFill &&
    isRecipientSelf &&
    shouldUseBasicFulfill(sanitizedOrder.parameters, totalFilled)
	) {
		// TODO: Use fulfiller proxy if there are approvals needed directly, but none needed for proxy
		await approveBeforeBasicFulfillOrder({
			ethereum,
			send,
			order,
			tips: tipConsiderationItems,
			offererBalancesAndApprovals,
			fulfillerBalancesAndApprovals,
			timeBasedItemParams,
			offererOperator,
			fulfillerOperator,
			disableCheckingBalances,
		})
		return getfulfillBasicOrderData({
			order: sanitizedOrder,
			timeBasedItemParams,
			conduitKey,
			tips: tipConsiderationItems,
			seaportContract,
		})
	}

	await approveBeforeStandardFulfillOrder({
		ethereum,
		send,
		order: sanitizedOrder,
		unitsToFill,
		totalFilled,
		totalSize: totalSize.eq(0)
			? getMaximumSizeForOrder(sanitizedOrder)
			: totalSize,
		offerCriteria,
		considerationCriteria,
		tips: tipConsiderationItems,
		offererBalancesAndApprovals,
		fulfillerBalancesAndApprovals,
		timeBasedItemParams,
		offererOperator,
		fulfillerOperator,
	})
	return getFulfillStandardOrderData({
		order: sanitizedOrder,
		unitsToFill,
		totalFilled,
		totalSize: totalSize.eq(0)
			? getMaximumSizeForOrder(sanitizedOrder)
			: totalSize,
		offerCriteria,
		considerationCriteria,
		tips: tipConsiderationItems,
		extraData,
		timeBasedItemParams,
		conduitKey,
		recipientAddress,
		seaportContract,
	})
}

export async function approveBeforeBasicFulfillOrder(
	{
		ethereum,
		send,
		order,
		tips = [],
		offererBalancesAndApprovals,
		fulfillerBalancesAndApprovals,
		timeBasedItemParams,
		offererOperator,
		fulfillerOperator,
		disableCheckingBalances,
	}: {
		ethereum: Ethereum,
		send: SendFunction,
		order: Order,
		tips: ConsiderationItem[],
		offererBalancesAndApprovals: BalancesAndApprovals;
		fulfillerBalancesAndApprovals: BalancesAndApprovals;
		timeBasedItemParams: TimeBasedItemParams;
		offererOperator: string;
		fulfillerOperator: string;
		disableCheckingBalances?: boolean;
	}) {
	const { offer, consideration } = order.parameters

	const considerationIncludingTips = [...consideration, ...tips]

	const insufficientApprovals = validateBasicFulfillBalancesAndApprovals({
		offer,
		consideration: considerationIncludingTips,
		offererBalancesAndApprovals,
		fulfillerBalancesAndApprovals,
		timeBasedItemParams,
		offererOperator,
		fulfillerOperator,
		disableCheckingBalances,
	})

	const approvalActions = await getApprovalActions(
		ethereum,
		send,
		insufficientApprovals,
	)
	return await Promise.all(approvalActions)
}

export async function approveBeforeStandardFulfillOrder(
	{
		ethereum,
		send,
		order,
		tips = [],
		offererBalancesAndApprovals,
		fulfillerBalancesAndApprovals,
		timeBasedItemParams,
		offererOperator,
		fulfillerOperator,
		unitsToFill = 0,
		totalSize,
		totalFilled,
		offerCriteria,
		considerationCriteria,
	}: {
		ethereum: Ethereum,
		send: SendFunction,
		order: Order,
		tips: ConsiderationItem[],
		offererBalancesAndApprovals: BalancesAndApprovals;
		fulfillerBalancesAndApprovals: BalancesAndApprovals;
		timeBasedItemParams: TimeBasedItemParams;
		offererOperator: string;
		fulfillerOperator: string;
		unitsToFill?: BigNumberValue;
		totalFilled: BigNumber;
		totalSize: BigNumber;
		offerCriteria: InputCriteria[];
		considerationCriteria: InputCriteria[];
	}) {
	const orderWithAdjustedFills = unitsToFill
		? mapOrderAmountsFromUnitsToFill(order, {
			unitsToFill,
			totalSize,
		})
		: // Else, we adjust the order by the remaining order left to be fulfilled
		mapOrderAmountsFromFilledStatus(order, {
			totalFilled,
			totalSize,
		})

	const {
		parameters: { offer, consideration },
	} = orderWithAdjustedFills


	const considerationIncludingTips = [...consideration, ...tips]

	const insufficientApprovals = validateStandardFulfillBalancesAndApprovals({
		offer,
		consideration: considerationIncludingTips,
		offerCriteria,
		considerationCriteria,
		offererBalancesAndApprovals,
		fulfillerBalancesAndApprovals,
		timeBasedItemParams,
		offererOperator,
		fulfillerOperator,
	})

	const approvalActions = await getApprovalActions(
		ethereum,
		send,
		insufficientApprovals,
	)
	return await Promise.all(approvalActions)
}
