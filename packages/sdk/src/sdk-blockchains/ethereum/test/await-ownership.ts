import type { ItemId } from "@rarible/api-client"
import type { UnionAddress } from "@rarible/types"
import { retry } from "../../../common/retry"
import type { IRaribleSdk } from "../../../domain"
import { convertToEthereumAddress } from "../common"

export async function awaitOwnership(sdk: IRaribleSdk, item: ItemId, owner: UnionAddress) {
  return retry(10, 2000, async () => {
    return sdk.apis.ownership.getOwnershipById({
      ownershipId: `${item}:${convertToEthereumAddress(owner)}`,
    })
  })
}
