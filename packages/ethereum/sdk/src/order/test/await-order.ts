import type { RaribleSdk } from "../../index"
import { retry } from "../../common/retry"
import type { RaribleEthereumApis } from "../../common/apis"

export async function awaitOrder(x: RaribleSdk | RaribleEthereumApis, hash: string) {
  const apis = "apis" in x ? x.apis : x
  return retry(20, 3000, async () => {
    return await apis.order.getValidatedOrderByHash({ hash: hash })
  })
}
