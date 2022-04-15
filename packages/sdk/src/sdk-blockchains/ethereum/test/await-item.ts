import type { ItemId } from "@rarible/api-client"
import type { IRaribleSdk } from "../../../domain"
import { retry } from "../../../common/retry"

export async function awaitItem(sdk: IRaribleSdk, itemId: ItemId) {
	return retry(10, 2000, () => sdk.apis.item.getItemById({ itemId }))
}
