import type { Ethereum } from "@rarible/ethereum-provider"
import { toAddress } from "@rarible/types"
import { toBn } from "@rarible/utils"
import type { BigNumber } from "@rarible/utils"
import { Warning } from "@rarible/logger/build"
import { createErc721Contract } from "../../contracts/erc721"
import { createErc20Contract } from "../../contracts/erc20"
import type { TimeBasedItemParams } from "./item"
import { getSummedTokenAndIdentifierAmounts } from "./item"
import type { OrderParameters } from "./types"
import { getItemToCriteriaMap } from "./criteria"
import type { InputCriteria, Item } from "./types"
import { isErc1155Item, isErc20Item, isErc721Item } from "./item"
import { balanceOf } from "./balance"
import { MAX_INT } from "./constants"
import type { ItemType } from "./constants"


export type BalancesAndApprovals = {
	token: string;
	identifierOrCriteria: string;
	balance: BigNumber;
	approvedAmount: BigNumber;
	itemType: ItemType;
}[]

export type InsufficientBalances = {
	token: string;
	identifierOrCriteria: string;
	requiredAmount: BigNumber;
	amountHave: BigNumber;
	itemType: ItemType;
}[]

export type InsufficientApprovals = {
	token: string;
	identifierOrCriteria: string;
	approvedAmount: BigNumber;
	requiredApprovedAmount: BigNumber;
	operator: string;
	itemType: ItemType;
}[]

export const getBalancesAndApprovals = async ({
	ethereum,
	owner,
	items,
	criterias,
	operator,
}: {
	ethereum: Ethereum;
	owner: string;
	items: Item[];
	criterias: InputCriteria[];
	operator: string;
}): Promise<BalancesAndApprovals> => {
	const itemToCriteria = getItemToCriteriaMap(items, criterias)

	return Promise.all(
		items.map(async (item) => {
			let approvedAmountPromise = toBn(0)

			if (isErc721Item(item.itemType) || isErc1155Item(item.itemType)) {
				const erc721 = createErc721Contract(ethereum, toAddress(item.token))
				const allowance: boolean = await erc721.functionCall("isApprovedForAll", owner, operator).call()
				approvedAmountPromise = allowance ? toBn(MAX_INT) : toBn(0)
			} else if (isErc20Item(item.itemType)) {
				const erc20 = createErc20Contract(ethereum, toAddress(item.token))
				approvedAmountPromise = toBn(await erc20.functionCall("allowance", owner, operator).call())
			} else {
				approvedAmountPromise = toBn(MAX_INT)
			}

			return {
				token: item.token,
				identifierOrCriteria:
          itemToCriteria.get(item)?.identifier ?? item.identifierOrCriteria,
				balance: await balanceOf(
					ethereum,
					owner,
					item,
					itemToCriteria.get(item)
				),
				approvedAmount: approvedAmountPromise,
				itemType: item.itemType,
			}
		})
	)
}

export const getInsufficientBalanceAndApprovalAmounts = ({
	balancesAndApprovals,
	tokenAndIdentifierAmounts,
	operator,
}: {
	balancesAndApprovals: BalancesAndApprovals;
	tokenAndIdentifierAmounts: ReturnType<
    typeof getSummedTokenAndIdentifierAmounts
	>;
	operator: string;
}): {
	insufficientBalances: InsufficientBalances;
	insufficientApprovals: InsufficientApprovals;
} => {
	const tokenAndIdentifierAndAmountNeeded = [
		...Object.entries(tokenAndIdentifierAmounts).map(
			([token, identifierToAmount]) =>
				Object.entries(identifierToAmount).map(
					([identifierOrCriteria, amountNeeded]) =>
						[token, identifierOrCriteria, amountNeeded] as const
				)
		),
	].flat()

	const filterBalancesOrApprovals = (
		filterKey: "balance" | "approvedAmount"
	): InsufficientBalances =>
		tokenAndIdentifierAndAmountNeeded
			.filter(([token, identifierOrCriteria, amountNeeded]) =>
				findBalanceAndApproval(
					balancesAndApprovals,
					token,
					identifierOrCriteria
				)[filterKey].lt(amountNeeded)
			)
			.map(([token, identifierOrCriteria, amount]) => {
				const balanceAndApproval = findBalanceAndApproval(
					balancesAndApprovals,
					token,
					identifierOrCriteria
				)

				return {
					token,
					identifierOrCriteria,
					requiredAmount: amount,
					amountHave: balanceAndApproval[filterKey],
					itemType: balanceAndApproval.itemType,
				}
			})

	const mapToApproval = (
		insufficientBalance: InsufficientBalances[number]
	): InsufficientApprovals[number] => ({
		token: insufficientBalance.token,
		identifierOrCriteria: insufficientBalance.identifierOrCriteria,
		approvedAmount: insufficientBalance.amountHave,
		requiredApprovedAmount: insufficientBalance.requiredAmount,
		itemType: insufficientBalance.itemType,
		operator,
	})

	const [insufficientBalances, insufficientApprovals] = [
		filterBalancesOrApprovals("balance"),
		filterBalancesOrApprovals("approvedAmount").map(mapToApproval),
	]

	return {
		insufficientBalances,
		insufficientApprovals,
	}
}

/**
 * 1. The offerer should have sufficient balance of all offered items.
 * 2. If the order does not indicate proxy utilization, the offerer should have sufficient approvals set
 *    for the Seaport contract for all offered ERC20, ERC721, and ERC1155 items.
 * 3. If the order does indicate proxy utilization, the offerer should have sufficient approvals set
 *    for their respective proxy contract for all offered ERC20, ERC721, and ERC1155 items.
 */
export const validateOfferBalancesAndApprovals = ({
	offer,
	criterias,
	balancesAndApprovals,
	timeBasedItemParams,
	throwOnInsufficientBalances = true,
	throwOnInsufficientApprovals,
	operator,
}: {
	balancesAndApprovals: BalancesAndApprovals;
	timeBasedItemParams?: TimeBasedItemParams;
	throwOnInsufficientBalances?: boolean;
	throwOnInsufficientApprovals?: boolean;
	operator: string;
} & Pick<OrderParameters, "offer"> & {
	criterias: InputCriteria[];
}): InsufficientApprovals => {
	const { insufficientBalances, insufficientApprovals } =
    getInsufficientBalanceAndApprovalAmounts({
    	balancesAndApprovals,
    	tokenAndIdentifierAmounts: getSummedTokenAndIdentifierAmounts({
    		items: offer,
    		criterias,
    		timeBasedItemParams: timeBasedItemParams
    			? { ...timeBasedItemParams, isConsiderationItem: false }
    			: undefined,
    	}),
    	operator,
    })

	if (throwOnInsufficientBalances && insufficientBalances.length > 0) {
		throw new Error(
			"The offerer does not have the amount needed to create or fulfill."
		)
	}

	if (throwOnInsufficientApprovals && insufficientApprovals.length > 0) {
		throw new Error("The offerer does not have the sufficient approvals.")
	}

	return insufficientApprovals
}

export const validateBasicFulfillBalancesAndApprovals = ({
	offer,
	consideration,
	offererBalancesAndApprovals,
	fulfillerBalancesAndApprovals,
	timeBasedItemParams,
	offererOperator,
	fulfillerOperator,
}: {
	offererBalancesAndApprovals: BalancesAndApprovals;
	fulfillerBalancesAndApprovals: BalancesAndApprovals;
	timeBasedItemParams: TimeBasedItemParams;
	offererOperator: string;
	fulfillerOperator: string;
} & Pick<OrderParameters, "offer" | "consideration">) => {
	validateOfferBalancesAndApprovals({
		offer,
		criterias: [],
		balancesAndApprovals: offererBalancesAndApprovals,
		timeBasedItemParams,
		throwOnInsufficientApprovals: true,
		operator: offererOperator,
	})

	const considerationWithoutOfferItemType = consideration.filter(
		(item) => item.itemType !== offer[0].itemType
	)

	const { insufficientBalances, insufficientApprovals } =
    getInsufficientBalanceAndApprovalAmounts({
    	balancesAndApprovals: fulfillerBalancesAndApprovals,
    	tokenAndIdentifierAmounts: getSummedTokenAndIdentifierAmounts({
    		items: considerationWithoutOfferItemType,
    		criterias: [],
    		timeBasedItemParams: {
    			...timeBasedItemParams,
    			isConsiderationItem: true,
    		},
    	}),
    	operator: fulfillerOperator,
    })

	if (insufficientBalances.length > 0) {
		throw new Warning(
			"The fulfiller does not have the balances needed to fulfill."
		)
	}

	return insufficientApprovals
}

export const validateStandardFulfillBalancesAndApprovals = ({
	offer,
	consideration,
	offerCriteria,
	considerationCriteria,
	offererBalancesAndApprovals,
	fulfillerBalancesAndApprovals,
	timeBasedItemParams,
	offererOperator,
	fulfillerOperator,
}: Pick<OrderParameters, "offer" | "consideration"> & {
	offerCriteria: InputCriteria[];
	considerationCriteria: InputCriteria[];
	offererBalancesAndApprovals: BalancesAndApprovals;
	fulfillerBalancesAndApprovals: BalancesAndApprovals;
	timeBasedItemParams: TimeBasedItemParams;
	offererOperator: string;
	fulfillerOperator: string;
}) => {
	validateOfferBalancesAndApprovals({
		offer,
		criterias: offerCriteria,
		balancesAndApprovals: offererBalancesAndApprovals,
		timeBasedItemParams,
		throwOnInsufficientApprovals: true,
		operator: offererOperator,
	})

	const fulfillerBalancesAndApprovalsAfterReceivingOfferedItems =
    addToExistingBalances({
    	items: offer,
    	criterias: offerCriteria,
    	balancesAndApprovals: fulfillerBalancesAndApprovals,
    	timeBasedItemParams,
    })

	const { insufficientBalances, insufficientApprovals } =
    getInsufficientBalanceAndApprovalAmounts({
    	balancesAndApprovals:
      fulfillerBalancesAndApprovalsAfterReceivingOfferedItems,
    	tokenAndIdentifierAmounts: getSummedTokenAndIdentifierAmounts({
    		items: consideration,
    		criterias: considerationCriteria,
    		timeBasedItemParams: {
    			...timeBasedItemParams,
    			isConsiderationItem: true,
    		},
    	}),
    	operator: fulfillerOperator,
    })

	if (insufficientBalances.length > 0) {
		throw new Warning(
			"The fulfiller does not have the balances needed to fulfill."
		)
	}

	return insufficientApprovals
}

const addToExistingBalances = ({
	items,
	criterias,
	timeBasedItemParams,
	balancesAndApprovals,
}: {
	items: Item[];
	criterias: InputCriteria[];
	timeBasedItemParams: TimeBasedItemParams;
	balancesAndApprovals: BalancesAndApprovals;
}) => {
	const summedItemAmounts = getSummedTokenAndIdentifierAmounts({
		items,
		criterias,
		timeBasedItemParams: { ...timeBasedItemParams, isConsiderationItem: false },
	})

	// Deep clone existing balances
	const balancesAndApprovalsAfterReceivingItems = balancesAndApprovals.map(
		(item) => ({ ...item })
	)

	// Add each summed item amount to the existing balances as we may want tocheck balances after receiving all items
	Object.entries(summedItemAmounts).forEach(
		([token, identifierOrCriteriaToAmount]) =>
			Object.entries(identifierOrCriteriaToAmount).forEach(
				([identifierOrCriteria, amount]) => {
					const balanceAndApproval = findBalanceAndApproval(
						balancesAndApprovalsAfterReceivingItems,
						token,
						identifierOrCriteria
					)

					const balanceAndApprovalIndex =
            balancesAndApprovalsAfterReceivingItems.indexOf(balanceAndApproval)

					balancesAndApprovalsAfterReceivingItems[
						balanceAndApprovalIndex
					].balance =
            balancesAndApprovalsAfterReceivingItems[
            	balanceAndApprovalIndex
            ].balance.plus(amount)
				}
			)
	)

	return balancesAndApprovalsAfterReceivingItems
}


function findBalanceAndApproval(
	balancesAndApprovals: BalancesAndApprovals,
	token: string,
	identifierOrCriteria: string
) {
	const balanceAndApproval = balancesAndApprovals.find(
		({
			token: checkedToken,
			identifierOrCriteria: checkedIdentifierOrCriteria,
		}) =>
			token.toLowerCase() === checkedToken.toLowerCase() &&
      checkedIdentifierOrCriteria.toLowerCase() ===
      identifierOrCriteria.toLowerCase()
	)

	if (!balanceAndApproval) {
		throw new Warning(
			"Balances and approvals didn't contain all tokens and identifiers"
		)
	}

	return balanceAndApproval
}
