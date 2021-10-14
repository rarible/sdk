import { retry } from "@rarible/protocol-ethereum-sdk/build/common/retry"
import { RaribleSdk } from "@rarible/protocol-ethereum-sdk"
import { ItemId } from "@rarible/api-client"

export async function awaitItem(sdk: RaribleSdk, itemId: ItemId) {
	await retry(3, async () => {
		await sdk.apis.nftItem.getNftItemById({ itemId })
	})
}
