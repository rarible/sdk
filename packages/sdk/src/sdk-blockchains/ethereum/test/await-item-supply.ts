import type { ItemId } from "@rarible/api-client"
import type { BigNumber } from "@rarible/types"
import type { IRaribleSdk } from "../../../domain"
import { retryBackoff } from "../../../common/retry-backoff"

export async function awaitItemSupply(sdk: IRaribleSdk, itemId: ItemId, value: BigNumber) {
	return retryBackoff(5, 2000, async () => {
		const item = await sdk.apis.item.getItemById({ itemId })
		if (value.toString() !== item.supply.toString()) {
			throw new Error("Item value is not equal to the current")
		}
		return item
	})
}
