import type { ItemId } from "@rarible/api-client"
import type { IRaribleSdk } from "../../../domain"
import { retry } from "../../../common/retry"

export async function awaitDeletedItem(sdk: IRaribleSdk, itemId: ItemId) {
	return retry(5, 2000, async () => {
		const item = await sdk.apis.item.getItemById({ itemId })
		expect(item.deleted).toBe(true)
		return item
	})
}
