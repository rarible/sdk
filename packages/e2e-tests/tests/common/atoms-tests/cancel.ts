import type { IRaribleSdk } from "@rarible/sdk/src/domain"
import type { BlockchainWallet } from "@rarible/sdk-wallet"
import type { IBlockchainTransaction } from "@rarible/sdk-transaction"
import type { CancelOrderRequest } from "@rarible/sdk/src/types/order/cancel/domain"
import { awaitOrderCancel } from "../helpers"

/**
 * Cancel an order
 */
export async function cancel(sdk: IRaribleSdk,
							 wallet: BlockchainWallet,
							 cancelRequest: CancelOrderRequest): Promise<IBlockchainTransaction> {
	try {
		const tx = await sdk.order.cancel(cancelRequest)
		await tx.wait()

		await awaitOrderCancel(sdk, cancelRequest.orderId)

		return tx
	} catch (e: any) {
		throw new Error(`Exception during order canceling: ${e.toString()}`)
	}
}
