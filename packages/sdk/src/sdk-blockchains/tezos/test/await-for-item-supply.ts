import type { ItemId } from "@rarible/types"
import type BigNumber from "bignumber.js"
import { retry } from "../../../common/retry"
import type { IRaribleSdk } from "../../../domain"

export async function awaitForItemSupply(sdk: IRaribleSdk, itemId: ItemId, supply: string | number | BigNumber) {
	await retry(10, 1000, async () => {
		const item = await sdk.apis.item.getItemById({
			itemId,
		})
		const itemSupply = item.supply.toString()
		const requireSupply = supply.toString()
		if (itemSupply !== requireSupply) {
			throw new Error(`Expected supply ${requireSupply}, but current supply ${itemSupply}`)
		}
	})
}
