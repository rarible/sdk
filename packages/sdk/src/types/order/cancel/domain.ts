import type { OrderId } from "@rarible/api-client"
import type { IBlockchainTransaction } from "@rarible/sdk-transaction"
import type { Action } from "@rarible/action"

export type CancelOrderRequest = {
	orderId: OrderId
}

export type ICancel = Action<"send-tx", CancelOrderRequest, IBlockchainTransaction>
