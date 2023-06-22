import type { RaribleSdk } from "../../index"
import { retry } from "../../common/retry"

export async function awaitOrder(sdk: RaribleSdk, hash: string) {
	return retry(20, 3000, async () => {
		return await sdk.apis.order.getValidatedOrderByHash({ hash: hash })
	})
}
