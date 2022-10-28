import { createRaribleSdk } from "@rarible/sdk/node"
import { toOrderId } from "@rarible/types"
import type { BlockchainWallet } from "@rarible/sdk-wallet"

export async function cancelOrder(wallet: BlockchainWallet) {
	const sdk = await createRaribleSdk(wallet, "testnet")
	const cancelTx = await sdk.order.cancel({
		orderId: toOrderId("<YOUR_ORDER_ID>"),
	})
	await cancelTx.wait()
}
