import type { ItemId } from "@rarible/types"
import type { Ownership } from "@rarible/api-client/build/models"
import type { IRaribleSdk } from "../../../domain"
import { retry } from "../../../common/retry"

export async function awaitForOwnership(sdk: IRaribleSdk, itemId: ItemId, receipent: string): Promise<Ownership> {
	return retry(10, 1000, async () => {
		return sdk.apis.ownership.getOwnershipById({
			ownershipId: `${itemId}:${receipent}`,
		})
	})
}
