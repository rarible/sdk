import { createRaribleSdk } from "@rarible/sdk"
import { toOrderId } from "@rarible/types"
import type { BlockchainWallet } from "@rarible/sdk-wallet"

//Available only for ethereum
export async function buy(wallet: BlockchainWallet) {
	const sdk = createRaribleSdk(wallet, "dev")
	const buyAction = await sdk.order.buy({
		orderId: toOrderId("<SELL_ORDER_ID>"),
	})
	//If you have one or more items from collection you should accept one item at the time
	const buyTx = await buyAction.submit({
		amount: 1,
		//optional
		infiniteApproval: true,
	})
	await buyTx.wait()
}
