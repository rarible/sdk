import type { IRaribleSdk } from "@rarible/sdk/src/domain"
import type { BlockchainWallet } from "@rarible/sdk-wallet"
import type { Order } from "@rarible/api-client"
import type { OrderRequest, PrepareOrderRequest } from "@rarible/sdk/src/types/order/common"
import type { CollectionId } from "@rarible/api-client"
import { toBn } from "@rarible/utils/build/bn"
import { awaitOrderStock } from "../helpers"
import { Logger } from "../logger"

/**
 * Make new bid order
 */
export async function bid(sdk: IRaribleSdk,
						   wallet: BlockchainWallet,
						   prepareOrderRequest: PrepareOrderRequest | { collectionId: CollectionId },
						   orderRequest: OrderRequest): Promise<Order> {
	Logger.log("bid, prepare_order_update_request=", prepareOrderRequest)
	const bidPrepare = await sdk.order.bid(prepareOrderRequest)

	Logger.log("bid, order_request=", orderRequest)
	const orderId = await bidPrepare.submit(orderRequest)
	Logger.log("order_id=", orderId)

	const makeStock = toBn(orderRequest.price).multipliedBy(orderRequest.amount).toString()
	return await awaitOrderStock(sdk, orderId, makeStock)
}
