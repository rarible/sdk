import type { ItemId } from "@rarible/api-client"
import type { IRaribleSdk } from "../../domain"
import { retry } from "../retry"

export async function awaitItem(sdk: IRaribleSdk, itemId: ItemId) {
	return retry(40, 1000, () => sdk.apis.item.getItemById({ itemId }))
}
