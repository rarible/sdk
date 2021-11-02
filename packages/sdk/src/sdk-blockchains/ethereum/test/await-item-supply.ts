import { retry } from "@rarible/protocol-ethereum-sdk/build/common/retry"
import { ItemId } from "@rarible/api-client"
import { BigNumber } from "@rarible/types"
import { IRaribleSdk } from "../../../domain"
import { logTime } from "../../../common/log-time"

export async function awaitItemSupply(sdk: IRaribleSdk, itemId: ItemId, value: BigNumber) {
	await logTime(`await item supply ${itemId} to be ${value}`, async () => {
		await retry(5, async () => {
			const item = await sdk.apis.item.getItemById({ itemId })
			if (value.toString() !== item.supply.toString()) {
				throw new Error("Item value is not equal to the current")
			}
		})
	})
}
