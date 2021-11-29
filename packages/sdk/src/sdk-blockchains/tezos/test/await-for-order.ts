import type { OrderId } from "@rarible/types"
import type { Order } from "@rarible/api-client/build/models"
import type { IRaribleSdk } from "../../../domain"
import { retry } from "../../../common/retry"

export async function awaitForOrder(sdk: IRaribleSdk, orderId: OrderId): Promise<Order> {
	return retry(10, 1000, async () => {
		return sdk.apis.order.getOrderById({
			id: orderId,
		})
	})
}
