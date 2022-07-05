import type { IRaribleSdk } from "@rarible/sdk/src/domain"
import type { BlockchainWallet } from "@rarible/sdk-wallet"
import type { FillRequest, PrepareFillRequest } from "@rarible/sdk/src/types/order/fill/domain"
import type { IBlockchainTransaction } from "@rarible/sdk-transaction"
import { Logger } from "../logger"

/**
 * Fill an bid order
 */
export async function acceptBid(sdk: IRaribleSdk,
						  wallet: BlockchainWallet,
						  prepareFillOrderRequest: PrepareFillRequest,
						  fillRequest: FillRequest): Promise<IBlockchainTransaction> {
	try {
		Logger.log("accept_bid, prepare_fill_order_request=", prepareFillOrderRequest)
		const acceptBidPrepare = await sdk.order.acceptBid(prepareFillOrderRequest)
		Logger.log("accept_bid, fill_request=", fillRequest)

		const tx = await acceptBidPrepare.submit(fillRequest)
		await tx.wait()

		// todo: add more checks for ownership
		return tx
	} catch (e: any) {
		throw new Error(`Exception during accept bid: ${e.message ?? e.toString()}`)
	}
}
