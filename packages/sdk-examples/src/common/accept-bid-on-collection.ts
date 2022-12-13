import { createRaribleSdk } from "@rarible/sdk/node"
import { toItemId, toOrderId } from "@rarible/types"
import type { BlockchainWallet } from "@rarible/sdk-wallet"

//Available only for ethereum
export async function acceptBidOnCollection(wallet: BlockchainWallet) {
	const sdk = await createRaribleSdk(wallet, "testnet")
	const acceptBidTx = await sdk.order.acceptBid({
		orderId: toOrderId("<COLLECTION_ORDER_ID>"),
		amount: 1,
		itemId: toItemId("<ACCEPTED_ITEM_ID>"),
		//optional
		infiniteApproval: true,
		//Set true if you want to convert received WETH/wTEZ tokens to ETH/TEZ
		unwrap: false,
	})
	//If you have one or more items from collection you should accept one item at the time
	await acceptBidTx.wait()
}
