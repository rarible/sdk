import type { OrderId } from "@rarible/types"
import type { IRaribleSdk } from "../../../domain"
import { retry } from "../../../common/retry"

export async function awaitOrderCancel(sdk: IRaribleSdk, orderId: OrderId) {
	return retry(5, 2000, async () => {
		const order = await sdk.apis.order.getOrderById({ id: orderId })
		if (order.cancelled === false) {
			throw new Error("Order is not cancelled")
		}
		return order
	})
}
