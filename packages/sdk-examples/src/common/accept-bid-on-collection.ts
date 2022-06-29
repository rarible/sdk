import { createRaribleSdk } from "@rarible/sdk"
import { toItemId, toOrderId } from "@rarible/types"
import type { BlockchainWallet } from "@rarible/sdk-wallet"

//Available only for ethereum
export async function acceptBidOnCollection(wallet: BlockchainWallet) {
	const sdk = createRaribleSdk(wallet, "dev")
	const acceptBidAction = await sdk.order.acceptBid({
		orderId: toOrderId("<COLLECTION_ORDER_ID>"),
	})
	//If you have one or more items from collection you should accept one item at the time
	const acceptBidTx = await acceptBidAction.submit({
		amount: 1,
		itemId: toItemId("<ACCEPTED_ITEM_ID>"),
		//optional
		infiniteApproval: true,
		//Set true if you want to convert received WETH/wTEZ tokens to ETH/TEZ
		unwrap: false,
	})
	await acceptBidTx.wait()
}
