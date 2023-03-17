import type { BigNumberValue } from "@rarible/utils/build/bn"
import { ZERO_ADDRESS } from "@rarible/types"
import type { Ethereum } from "@rarible/ethereum-provider"
import type { Address } from "@rarible/ethereum-api-client"
import type { EthereumContract } from "@rarible/ethereum-provider"
import type { SendFunction } from "../../../common/send-transaction"
import type { ConsiderationItem, InputCriteria, Order, OrderStruct } from "./types"
import type { BalancesAndApprovals } from "./balance-and-approval-check"
import type { TimeBasedItemParams } from "./item"
import { mapOrderAmountsFromFilledStatus, mapOrderAmountsFromUnitsToFill } from "./order"
import { getSummedTokenAndIdentifierAmounts, isCriteriaItem } from "./item"
import { validateStandardFulfillBalancesAndApprovals } from "./balance-and-approval-check"
import { getApprovalActions } from "./approval"
import { getAdvancedOrderNumeratorDenominator } from "./fulfill"
import { generateCriteriaResolvers } from "./criteria"

export async function getFulfillAdvancedOrderData({
	ethereum,
	send,
	order,
	unitsToFill = 0,
	totalSize,
	totalFilled,
	offerCriteria,
	considerationCriteria,
	tips = [],
	extraData,
	offererBalancesAndApprovals,
	fulfillerBalancesAndApprovals,
	offererOperator,
	fulfillerOperator,
	timeBasedItemParams,
	conduitKey,
	recipientAddress,
	seaportContract,
}: {
	ethereum: Ethereum,
	send: SendFunction
	order: Order;
	unitsToFill?: BigNumberValue;
	totalFilled: BigNumberValue;
	totalSize: BigNumberValue;
	offerCriteria: InputCriteria[];
	considerationCriteria: InputCriteria[];
	tips?: ConsiderationItem[];
	extraData?: string;
	seaportAddress: Address;
	offererBalancesAndApprovals: BalancesAndApprovals;
	fulfillerBalancesAndApprovals: BalancesAndApprovals;
	offererOperator: string;
	fulfillerOperator: string;
	conduitKey: string;
	recipientAddress: string;
	timeBasedItemParams: TimeBasedItemParams;
	seaportContract: EthereumContract,
}) {
	// const seaportContract = createSeaportV14Contract(ethereum, seaportAddress)

	// If we are supplying units to fill, we adjust the order by the minimum of the amount to fill and
	// the remaining order left to be fulfilled
	const orderWithAdjustedFills = unitsToFill
		? mapOrderAmountsFromUnitsToFill(order, {
			unitsToFill,
			totalFilled,
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

	const offerCriteriaItems = offer.filter(({ itemType }) =>
		isCriteriaItem(itemType)
	)

	const considerationCriteriaItems = considerationIncludingTips.filter(
		({ itemType }) => isCriteriaItem(itemType)
	)

	const hasCriteriaItems =
    offerCriteriaItems.length > 0 || considerationCriteriaItems.length > 0

	if (
		offerCriteriaItems.length !== offerCriteria.length ||
    considerationCriteriaItems.length !== considerationCriteria.length
	) {
		throw new Error(
			"You must supply the appropriate criterias for criteria based items"
		)
	}

	const totalNativeAmount = getSummedTokenAndIdentifierAmounts({
		items: considerationIncludingTips,
		criterias: considerationCriteria,
		timeBasedItemParams: {
			...timeBasedItemParams,
			isConsiderationItem: true,
		},
	})[ZERO_ADDRESS]?.["0"]

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

	await getApprovalActions(
		ethereum,
		send,
		insufficientApprovals,
	)

	const orderAccountingForTips: OrderStruct = {
		...order,
		parameters: {
			...order.parameters,
			consideration: [...order.parameters.consideration, ...tips],
			totalOriginalConsiderationItems: consideration.length,
		},
	}

	const { numerator, denominator } = getAdvancedOrderNumeratorDenominator(
		order,
		unitsToFill
	)

	const fulfillAdvancedOrderArgs = [
		{
			...orderAccountingForTips,
			numerator,
			denominator,
			extraData: extraData ?? "0x",
		},
		hasCriteriaItems
			? generateCriteriaResolvers({
				orders: [order],
				offerCriterias: [offerCriteria],
				considerationCriterias: [considerationCriteria],
			})
			: [],
		conduitKey,
		recipientAddress,
	]

	return {
		data: await seaportContract.functionCall("fulfillAdvancedOrder", ...fulfillAdvancedOrderArgs).getData(),
		value: totalNativeAmount.toString(),
	}
}
