import type { IRaribleSdk } from "@rarible/sdk"
import type { CollectionId } from "@rarible/api-client"
import { retry } from "@rarible/sdk-common"

export async function awaitCollection(sdk: IRaribleSdk, collectionId: CollectionId) {
  return retry(10, 4000, () => sdk.apis.collection.getCollectionById({ collection: collectionId }))
}
