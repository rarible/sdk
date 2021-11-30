import type { ContractAddress } from "@rarible/types"
import type { Collection } from "@rarible/api-client"
import type { IRaribleSdk } from "../../../domain"
import { retry } from "../../../common/retry"

export function awaitForCollection(
	sdk: IRaribleSdk, collection: ContractAddress
): Promise<Collection> {
	return retry(10, 1000, async () => {
		return sdk.apis.collection.getCollectionById({
			collection,
		})
	})
}
