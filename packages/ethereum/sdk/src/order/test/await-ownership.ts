import type { BigNumberLike, Address, EVMAddress } from "@rarible/types"
import { retry } from "../../common/retry"
import type { RaribleSdk } from "../../index"

export async function awaitOwnership(
  sdk: RaribleSdk,
  itemId: string,
  owner: Address | EVMAddress,
  amount: BigNumberLike | string,
) {
  return retry(20, 3000, async () => {
    const ownership = await sdk.apis.nftOwnership.getNftOwnershipById({
      ownershipId: `${itemId}:${owner}`,
    })
    if (ownership.value.toString() !== amount.toString()) {
      throw new Error(`Owner should has ${amount} tokens`)
    }
    return ownership
  })
}
