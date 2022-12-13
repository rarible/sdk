import { createRaribleSdk } from "@rarible/sdk/node"
import type { RequestCurrency } from "@rarible/sdk/node"
import { toCollectionId } from "@rarible/types"
import type { BlockchainWallet } from "@rarible/sdk-wallet"

//Available only for ethereum
export async function bidOnCollection(wallet: BlockchainWallet, assetType: RequestCurrency) {
	const sdk = await createRaribleSdk(wallet, "testnet")
	const bidOrderId = await sdk.order.bid({
		collectionId: toCollectionId("<COLLECTION_ADDRESS>"),
		amount: 1,
		price: "0.000002",
		currency: assetType,
		//+1 hour (optional)
		expirationDate: new Date(Date.now() + 60 * 60 * 1000),
	})
	return bidOrderId
}
