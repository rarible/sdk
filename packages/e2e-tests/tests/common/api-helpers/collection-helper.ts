import type { IRaribleSdk } from "@rarible/sdk/src/domain"
import type { Collection } from "@rarible/api-client/build/models"
import { retry } from "@rarible/sdk/src/common/retry"

/**
 * Get Collection by id
 */
export async function getCollectionById(sdk: IRaribleSdk, collectionId: string): Promise<Collection> {
	const collection = await retry(15, 3000, async () => {
		return await sdk.apis.collection.getCollectionById({
			collection: collectionId,
		})
	})
	expect(collection).not.toBe(null)
	return collection
}
