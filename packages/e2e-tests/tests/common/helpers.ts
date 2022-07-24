import type { OrderId } from "@rarible/api-client"
import type { IRaribleSdk } from "@rarible/sdk/src/domain"
import { retry } from "@rarible/sdk/src/common/retry"
import type { BigNumber } from "@rarible/types"
import type { Order } from "@rarible/api-client/build/models"
import type { Collection } from "@rarible/api-client/build/models"
import type { ItemId } from "@rarible/types"
import type { Ownership } from "@rarible/api-client/build/models"


export async function awaitOrderStock(
	sdk: IRaribleSdk,
	id: OrderId,
	awaitingValue: BigNumber | string,
): Promise<Order> {
	return retry(20, 2000, async () => {
		const order = await sdk.apis.order.getOrderById({ id })
		expect(order.makeStock.toString()).toEqual(awaitingValue.toString())
		return order
	})
}

export async function awaitOrderCancel(sdk: IRaribleSdk, id: OrderId): Promise<Order> {
	return retry(10, 2000, async () => {
		const order = await sdk.apis.order.getOrderById({ id })

		if (order.cancelled === false) {
			throw new Error("Stock is not canceled")
		}
		expect(order.cancelled).toEqual(true)
		return order
	})
}

export async function awaitForItemSupply(
	sdk: IRaribleSdk,
	itemId: ItemId,
	supply: string | number | BigNumber,
): Promise<string> {
	return retry(10, 2000, async () => {
		const item = await sdk.apis.item.getItemById({
			itemId,
		})
		const itemSupply = item.supply.toString()
		const requireSupply = supply.toString()
		if (itemSupply !== requireSupply) {
			throw new Error(`Expected supply ${requireSupply}, but current supply ${itemSupply}`)
		}
		return itemSupply
	})
}

export async function awaitForOwnership(sdk: IRaribleSdk, itemId: ItemId, receipent: string): Promise<Ownership> {
	return retry(10, 2000, async () => {
		const ownership = await sdk.apis.ownership.getOwnershipById({
			ownershipId: `${itemId}:${receipent}`,
		})

		expect(ownership.owner.slice(ownership.owner.indexOf(":") + 1)).toEqual(receipent)

		return ownership
	})
}

/**
 * Get Collection by Id
 */
export async function getCollection(sdk: IRaribleSdk, collectionId: string): Promise<Collection> {
	const collection = await retry(15, 3000, async () => {
		return await sdk.apis.collection.getCollectionById({
			collection: collectionId,
		})
	})

	expect(collection).not.toBe(null)

	return collection
}
