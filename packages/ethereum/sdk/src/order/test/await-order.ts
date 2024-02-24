import type { RaribleSdk } from "../../index"
import { retry } from "../../common/retry"
import type { RaribleEthereumApis } from "../../common/apis"

export async function awaitOrder(o: RaribleSdk | RaribleEthereumApis, hash: string) {
	const apis = "apis" in o ? o.apis : o
	return retry(20, 3000, async () => {
		return await apis.order.getValidatedOrderByHash({ hash: hash })
	})
}
