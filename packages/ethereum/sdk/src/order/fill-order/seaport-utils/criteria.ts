import { ItemType, Side } from "./constants"
import type { InputCriteria, Item, Order } from "./types"

export const generateCriteriaResolvers = ({
	orders,
	offerCriterias = [[]],
	considerationCriterias = [[]],
}: {
	orders: Order[];
	offerCriterias?: InputCriteria[][];
	considerationCriterias?: InputCriteria[][];
}) => {
	const offerCriteriaItems = orders.flatMap((order, orderIndex) =>
		order.parameters.offer
			.map(
				(item, index) =>
					({
						orderIndex,
						item,
						index,
						side: Side.OFFER,
					} as const)
			)
			.filter(({ item }) => isCriteriaItem(item.itemType))
	)

	const considerationCriteriaItems = orders.flatMap((order, orderIndex) =>
		order.parameters.consideration
			.map(
				(item, index) =>
					({
						orderIndex,
						item,
						index,
						side: Side.CONSIDERATION,
					} as const)
			)
			.filter(({ item }) => isCriteriaItem(item.itemType))
	)

	const mapCriteriaItemsToResolver = (
		criteriaItems:
		| typeof offerCriteriaItems
		| typeof considerationCriteriaItems,
		criterias: InputCriteria[][]
	) =>
		criteriaItems.map(({ orderIndex, item, index, side }, i) => {
			const merkleRoot = item.identifierOrCriteria || "0"
			const inputCriteria: InputCriteria = criterias[orderIndex][i]

			return {
				orderIndex,
				index,
				side,
				identifier: inputCriteria.identifier,
				criteriaProof: merkleRoot === "0" ? [] : inputCriteria.proof,
			}
		})

	const criteriaResolvers = [
		...mapCriteriaItemsToResolver(offerCriteriaItems, offerCriterias),
		...mapCriteriaItemsToResolver(
			considerationCriteriaItems,
			considerationCriterias
		),
	]

	return criteriaResolvers
}

export const getItemToCriteriaMap = (
	items: Item[],
	criterias: InputCriteria[]
) => {
	const criteriasCopy = [...criterias]

	return items.reduce((map, item) => {
		if (isCriteriaItem(item.itemType)) {
			map.set(item, criteriasCopy.shift() as InputCriteria)
		}
		return map
	}, new Map<Item, InputCriteria>())
}

export const isCriteriaItem = (itemType: Item["itemType"]) =>
	[ItemType.ERC721_WITH_CRITERIA, ItemType.ERC1155_WITH_CRITERIA].includes(
		itemType
	)
