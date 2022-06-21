import type { IRaribleSdk } from "@rarible/sdk/src/domain"
import type { BlockchainWallet } from "@rarible/sdk-wallet"
import type { Order } from "@rarible/api-client"
import { toBigNumber } from "@rarible/types"
import type { OrderRequest, PrepareOrderRequest } from "@rarible/sdk/src/types/order/common"
import { awaitOrderStock } from "../helpers"

/**
 * Make new sell order and check stocks
 */
export async function sell(sdk: IRaribleSdk,
						   wallet: BlockchainWallet,
						   prepareOrderRequest: PrepareOrderRequest,
						   orderRequest: OrderRequest): Promise<Order> {
	console.log("sell, prepare_order_request=", prepareOrderRequest)
	// Get sell info
	const sellPrepare = await sdk.order.sell(prepareOrderRequest)
	//expect(parseInt(sellPrepare.maxAmount)).toBeGreaterThanOrEqual(orderRequest.amount)

	console.log("sell, order_request=", orderRequest)
	// Submit sell order
	const orderId = await sellPrepare.submit(orderRequest)
	console.log("order_id=", orderId)
	// Check order stock to be equal sell amount
	const nextStock = toBigNumber((orderRequest.amount || 1).toString())
	return await awaitOrderStock(sdk, orderId, nextStock)
}
