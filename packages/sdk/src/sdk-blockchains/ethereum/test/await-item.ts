import type { ItemId } from "@rarible/api-client"
import type { IRaribleSdk } from "../../../domain"
import { retryBackoff } from "../../../common/retry-backoff"

export async function awaitItem(sdk: IRaribleSdk, itemId: ItemId) {
	return retryBackoff(5, 2000, () => sdk.apis.item.getItemById({ itemId }))
}
