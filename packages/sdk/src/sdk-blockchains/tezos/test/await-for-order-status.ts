import type { OrderId } from "@rarible/types"
import type { IRaribleSdk } from "../../../domain"
import { retry } from "../../../common/retry"

export async function awaitForOrderStatus(sdk: IRaribleSdk, orderId: OrderId, status: string): Promise<void> {
	return retry(10, 1000, async () => {
		const order = await sdk.apis.order.getOrderById({
			id: orderId,
		})
		if (order.status !== status) {
			throw new Error(`Order status=${order.status}, expected=${status}`)
		}
	})
}
