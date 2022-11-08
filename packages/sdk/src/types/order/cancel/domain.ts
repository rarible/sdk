import type { OrderId } from "@rarible/api-client"
import type { IBlockchainTransaction } from "@rarible/sdk-transaction"
import type { Action } from "@rarible/action"

export type CancelOrderRequest = {
	orderId: OrderId
}

/**
 * Cancel order action
 * @example
 * const tx = await sdk.order.cancel.start({ orderId }).runAll()
 */
export type ICancelAction = Action<"send-tx", CancelOrderRequest, IBlockchainTransaction>
