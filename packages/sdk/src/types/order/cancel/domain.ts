import { OrderId } from "@rarible/api-client"
import { IBlockchainTransaction } from "@rarible/sdk-transaction"
import { Action } from "@rarible/action"

export type CancelOrderRequest = {
	orderId: OrderId
}

export type ICancel = Action<"send-tx", CancelOrderRequest, IBlockchainTransaction>
