import type { OrderId } from "@rarible/api-client"
import type { IRaribleSdk } from "@rarible/sdk/src/domain"
import { retry } from "@rarible/sdk/src/common/retry"
import type { BigNumber } from "@rarible/types"
import type { Order } from "@rarible/api-client/build/models"
import type { Collection } from "@rarible/api-client/build/models"

export async function awaitStock(sdk: IRaribleSdk, id: OrderId, awaitingValue: BigNumber): Promise<Order> {
	return retry(10, 2000, async () => {
		const order = await sdk.apis.order.getOrderById({ id })
		if (awaitingValue.toString() !== order.makeStock.toString()) {
			throw new Error(`Stock is not equal. Expected: ${awaitingValue.toString()} Received: ${order.makeStock.toString()}`)
		}

		expect(order.makeStock.toString()).toEqual(awaitingValue)
		return order
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
