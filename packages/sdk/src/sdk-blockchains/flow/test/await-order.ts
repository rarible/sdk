import type { FlowSdk } from "@rarible/flow-sdk"
import { retry } from "../../../common/retry"

export async function awaitFlowOrder(sdk: FlowSdk, orderId: string) {
	return retry(10, 4000, async () => {
		return sdk.apis.order.getOrderByOrderId({ orderId })
	})
}
