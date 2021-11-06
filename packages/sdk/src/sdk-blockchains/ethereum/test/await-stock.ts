import type { OrderId } from "@rarible/api-client"
import type { IRaribleSdk } from "../../../domain"
import { retry } from "../../../common/retry"

export async function awaitStock(sdk: IRaribleSdk, id: OrderId, value: string | number) {
	return retry(5, 2000, async () => {
		const order = await sdk.apis.order.getOrderById({ id })
		if (value.toString() !== order.makeStock.toString()) {
			throw new Error("Stock is not equal")
		}
		return order
	})
}
