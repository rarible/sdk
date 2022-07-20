import type { IRaribleSdk } from "@rarible/sdk/src/domain"
import type { BlockchainWallet } from "@rarible/sdk-wallet"
import type { IBlockchainTransaction } from "@rarible/sdk-transaction"
import type { CancelOrderRequest } from "@rarible/sdk/src/types/order/cancel/domain"
import { awaitOrderCancel } from "../helpers"
import { Logger } from "../logger"

/**
 * Cancel an order
 */
export async function cancel(sdk: IRaribleSdk,
							 wallet: BlockchainWallet,
							 cancelRequest: CancelOrderRequest): Promise<IBlockchainTransaction> {
	// try {
	Logger.log("cancel order/bid, cancel_request=", cancelRequest)
	const tx = await sdk.order.cancel(cancelRequest)
	await tx.wait()

	await awaitOrderCancel(sdk, cancelRequest.orderId)

	return tx
	// } catch (e: any) {
	// 	throw new Error(`Exception during order canceling: ${e.toString()}`)
	// }
}
