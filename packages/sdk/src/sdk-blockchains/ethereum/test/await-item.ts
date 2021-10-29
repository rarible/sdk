import { retry } from "@rarible/protocol-ethereum-sdk/build/common/retry"
import { ItemId } from "@rarible/api-client"
import { IRaribleSdk } from "../../../domain"

export async function awaitItem(sdk: IRaribleSdk, itemId: ItemId) {
	await retry(3, async () => {
		await sdk.apis.item.getItemById({ itemId })
	})
}
