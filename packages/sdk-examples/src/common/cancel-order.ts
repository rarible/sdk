import { createRaribleSdk } from "@rarible/sdk"
import { toOrderId } from "@rarible/types"
import type { BlockchainWallet } from "@rarible/sdk-wallet"

export async function cancelOrder(wallet: BlockchainWallet) {
	const sdk = createRaribleSdk(wallet, "dev")
	const cancelTx = await sdk.order.cancel({
		orderId: toOrderId("<YOUR_ORDER_ID>"),
	})
	await cancelTx.wait()
}
