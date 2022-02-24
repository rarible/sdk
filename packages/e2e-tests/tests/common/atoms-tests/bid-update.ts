import type { IRaribleSdk } from "@rarible/sdk/src/domain"
import type { BlockchainWallet } from "@rarible/sdk-wallet"
import type { Order } from "@rarible/api-client"
import type { OrderRequest, PrepareOrderRequest } from "@rarible/sdk/src/types/order/common"
import { OrderUpdateRequest, PrepareOrderUpdateRequest } from "@rarible/sdk/build/types/order/common";
import { PrepareBidUpdateResponse } from "@rarible/sdk/src/types/order/bid/domain";

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
	expect(orderId).toBe(prepareOrderUpdateRequest.orderId)
	// Check order
	//return await awaitOrderStock(sdk, orderId, orderRequest.price.toString())
	return await sdk.apis.order.getOrderById({ id: orderId })
}
