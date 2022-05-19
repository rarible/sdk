import type { IRaribleSdk } from "@rarible/sdk/src/domain"
import type { BlockchainWallet } from "@rarible/sdk-wallet"
import type { Order } from "@rarible/api-client"
import type { OrderUpdateRequest, PrepareOrderUpdateRequest } from "@rarible/sdk/build/types/order/common"
import { BlockchainGroup } from "@rarible/api-client"

/**
 * Make update of bid order
 */
export async function bidUpdate(sdk: IRaribleSdk,
	wallet: BlockchainWallet,
	prepareOrderUpdateRequest: PrepareOrderUpdateRequest,
	orderUpdateRequest: OrderUpdateRequest): Promise<Order> {
	console.log("bidUpdate, prepare_order_update_request=", prepareOrderUpdateRequest)
	// Get bid info
	const prepareBidUpdateResponse = await sdk.order.bidUpdate(prepareOrderUpdateRequest)

	console.log("bidUpdate, order_update_request=", orderUpdateRequest)
	// Submit bid order
	const orderId = await prepareBidUpdateResponse.submit(orderUpdateRequest)
	// Flow create new order when update
	if (wallet.blockchain !== BlockchainGroup.FLOW) {
		expect(orderId).toBe(prepareOrderUpdateRequest.orderId)
	}
	// Check order
	//return await awaitOrderStock(sdk, orderId, orderRequest.price.toString())
	return await sdk.apis.order.getOrderById({ id: orderId })
}
