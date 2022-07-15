import type { IRaribleSdk } from "@rarible/sdk/src/domain"
import type { BlockchainWallet } from "@rarible/sdk-wallet"
import { retry } from "@rarible/sdk/src/common/retry"
import type { OrderUpdateRequest, PrepareOrderUpdateRequest } from "@rarible/sdk/build/types/order/common"
import type { Order } from "@rarible/api-client"
import { BlockchainGroup } from "@rarible/api-client"
import { Logger } from "../logger"

/**
 * Update sell order and check stocks
 */
export async function sellUpdate(
	sdk: IRaribleSdk,
	wallet: BlockchainWallet,
	prepareOrderUpdateRequest: PrepareOrderUpdateRequest,
	orderUpdateRequest: OrderUpdateRequest,
): Promise<Order> {
	Logger.log("sellUpdate, prepare_order_update_request=", prepareOrderUpdateRequest)
	// Get sell info
	const prepareOrderUpdateResponse = await sdk.order.sellUpdate(prepareOrderUpdateRequest)

	Logger.log("prepare_order_update_response", prepareOrderUpdateResponse)
	Logger.log("sellUpdate, order_update_request=", orderUpdateRequest)
	// Submit sell order
	const orderId = await prepareOrderUpdateResponse.submit(orderUpdateRequest)
	Logger.log("order_id", orderId)
	// Flow create new order when update
	if (wallet.blockchain !== BlockchainGroup.FLOW) {
		expect(orderId).toBe(prepareOrderUpdateRequest.orderId)
	}
	// Check order stock to be equal sell amount
	// const nextStock = toBigNumber(orderRequest.amount.toString())
	// return await awaitOrderStock(sdk, orderId, nextStock)

	return await retry(10, 3000, async () => {
		const order = await sdk.apis.order.getOrderById({ id: orderId })
		expect(order.makePrice?.toString()).toEqual(orderUpdateRequest.price.toString())
		return order
	})
}
