import type { IRaribleSdk } from "@rarible/sdk/src/domain"
import type { BlockchainWallet } from "@rarible/sdk-wallet"
import type { FillRequest, PrepareFillRequest } from "@rarible/sdk/src/types/order/fill/domain"
import type { IBlockchainTransaction } from "@rarible/sdk-transaction"
import type { ItemId } from "@rarible/types"
import { awaitForOwnership } from "../helpers"
import { getWalletAddressFull } from "../wallet"
import { Logger } from "../logger"

/**
 * Buying an nft
 */
export async function buy(
	sdk: IRaribleSdk,
	wallet: BlockchainWallet,
	itemId: ItemId,
	prepareFillOrderRequest: PrepareFillRequest,
	fillRequest: FillRequest,
): Promise<IBlockchainTransaction> {
	Logger.log("buy, prepare_fill_order_request=", prepareFillOrderRequest)
	const buyPrepare = await sdk.order.buy(prepareFillOrderRequest)

	Logger.log("buy, fill_request=", fillRequest)

	const tx = await buyPrepare.submit(fillRequest)
	await tx.wait()

	Logger.log("submit_buy_response_tx", tx)

	const address = await getWalletAddressFull(wallet)
	await awaitForOwnership(sdk, itemId, address.address)
	return tx
}
