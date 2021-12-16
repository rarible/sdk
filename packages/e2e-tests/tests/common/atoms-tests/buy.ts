import type { IRaribleSdk } from "@rarible/sdk/src/domain"
import type { BlockchainWallet } from "@rarible/sdk-wallet"
import type { FillRequest, PrepareFillRequest } from "@rarible/sdk/src/types/order/fill/domain"
import type { IBlockchainTransaction } from "@rarible/sdk-transaction"

/**
 * Buying an nft
 */
export async function buy(sdk: IRaribleSdk,
						  wallet: BlockchainWallet,
						  prepareFillOrderRequest: PrepareFillRequest,
						  fillRequest: FillRequest): Promise<IBlockchainTransaction> {
	const buyPrepare = await sdk.order.buy(prepareFillOrderRequest)
	const tx = await buyPrepare.submit(fillRequest)
	await tx.wait()

	return tx
}
