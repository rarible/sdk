import type { OrderId } from "@rarible/types"
import type { IRaribleSdk } from "../../../domain"
import { retryBackoff } from "../../../common/retry-backoff"

export async function awaitOrderCancel(sdk: IRaribleSdk, orderId: OrderId) {
	return retryBackoff(5, 2000, async () => {
		const order = await sdk.apis.order.getOrderById({ id: orderId })
		if (order.cancelled === false) {
			throw new Error("Order is not cancelled")
		}
		return order
	})
}
