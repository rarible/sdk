import type { BigNumber } from "@rarible/types"
import { retry } from "../../common/retry"
import type { RaribleEthereumApis } from "../../common/apis"

export async function awaitOwnership(
  apis: RaribleEthereumApis,
  contract: string,
  tokenId: BigNumber,
  recepient: string,
) {
  return retry(20, 3000, async () => {
    return await apis.nftOwnership.getNftOwnershipById({
      ownershipId: `${contract}:${tokenId}:${recepient}`,
    })
  })
}
