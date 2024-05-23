import { retry } from "../../common/retry"
import type { RaribleEthereumApis } from "../../common/apis"

export async function awaitItem(apis: RaribleEthereumApis, itemId: string) {
  await retry(10, 5000, () =>
    apis.nftItem.getNftItemById({
      itemId: itemId,
    }),
  )
}
