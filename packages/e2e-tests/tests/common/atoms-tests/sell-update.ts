import type { IRaribleSdk } from "@rarible/sdk/src/domain"
import type { BlockchainWallet } from "@rarible/sdk-wallet"
import type { OrderUpdateRequest, PrepareOrderUpdateRequest } from "@rarible/sdk/build/types/order/common"

/**
 * Update sell order and check stocks
 */
export async function sellUpdate(sdk: IRaribleSdk,
						   wallet: BlockchainWallet,
						   prepareOrderUpdateRequest: PrepareOrderUpdateRequest,
						   orderUpdateRequest: OrderUpdateRequest) {
	console.log("sellUpdate, prepare_order_update_request=", prepareOrderUpdateRequest)
	// Get sell info
	const prepareOrderUpdateResponse = await sdk.order.sellUpdate(prepareOrderUpdateRequest)

	console.log("prepare_order_update_response", prepareOrderUpdateResponse)
	console.log("sellUpdate, order_update_request=", orderUpdateRequest)
	// Submit sell order
	const orderId = await prepareOrderUpdateResponse.submit(orderUpdateRequest)
	expect(orderId).toBe(prepareOrderUpdateRequest.orderId)
	// Check order stock to be equal sell amount
	// const nextStock = toBigNumber(orderRequest.amount.toString())
	// return await awaitOrderStock(sdk, orderId, nextStock)
}
