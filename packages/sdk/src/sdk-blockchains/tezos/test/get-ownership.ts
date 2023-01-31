import type { ItemId } from "@rarible/types"
import type { IRaribleSdk } from "../../../index"

export async function getOwnershipValue(sdk: IRaribleSdk, itemId: ItemId, address: string): Promise<string> {
	try {
		const { value } = await sdk.apis.ownership.getOwnershipById({
			ownershipId: `${itemId}:${address}`,
		})
		return value
	} catch (e) {}

	return "0"
}
