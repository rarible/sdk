import type { IRaribleSdk } from "@rarible/sdk/src/domain"
import type { BlockchainWallet } from "@rarible/sdk-wallet"
import type { FillRequest, PrepareFillRequest } from "@rarible/sdk/src/types/order/fill/domain"
import type { IBlockchainTransaction } from "@rarible/sdk-transaction"
import type { ItemId } from "@rarible/types"
import { awaitForOwnership } from "../helpers"
import { getWalletAddress } from "../wallet"

/**
 * Buying an nft
 */
export async function buy(sdk: IRaribleSdk,
						  wallet: BlockchainWallet,
						  itemId: ItemId,
						  prepareFillOrderRequest: PrepareFillRequest,
						  fillRequest: FillRequest): Promise<IBlockchainTransaction> {
	try {
		console.log("prepare_fill_order_request=", prepareFillOrderRequest)
		const buyPrepare = await sdk.order.buy(prepareFillOrderRequest)
		console.log("fill_request=", fillRequest)
		const tx = await buyPrepare.submit(fillRequest)
		await tx.wait()
		console.log("submit_buy_response_tx", tx)
		await awaitForOwnership(sdk, itemId, await getWalletAddress(wallet, false))
		return tx
	} catch (e: any) {
		throw new Error(`Exception during purchase: ${e.message ?? e.toString()}`)
	}
}
