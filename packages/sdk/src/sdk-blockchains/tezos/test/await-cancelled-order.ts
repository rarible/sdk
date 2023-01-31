import type { OrderId } from "@rarible/types"
import { retry } from "../../../common/retry"
import type { IRaribleSdk } from "../../../domain"

export function awaitCancelledOrder(
	sdk: IRaribleSdk,
	orderId: OrderId
) {
	return retry(10, 2000, async () => {
		const canceledOrder = await sdk.apis.order.getOrderById({
			id: orderId,
		})
		if (canceledOrder.status !== "CANCELLED") {
			throw new Error("Order has not been cancelled")
		}
	})
}
