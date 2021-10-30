import { retry } from "@rarible/protocol-ethereum-sdk/build/common/retry"
import { ItemId } from "@rarible/api-client"
import { BigNumber } from "@rarible/types"
import { IRaribleSdk } from "../../../domain"

export async function awaitItemValue(sdk: IRaribleSdk, itemId: ItemId, value: BigNumber) {
	await retry(5, async () => {
		const item = await sdk.apis.item.getItemById({ itemId })
		if (value.toString() !== item.supply.toString()) {
			throw new Error("Item value is not equal to the current")
		}
	})
}
