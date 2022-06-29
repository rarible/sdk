import { createRaribleSdk } from "@rarible/sdk"
import { toCollectionId } from "@rarible/types"
import type { BlockchainWallet } from "@rarible/sdk-wallet"
import type { RequestCurrency } from "@rarible/sdk/build/common/domain"

//Available only for ethereum
export async function bidOnCollection(wallet: BlockchainWallet, assetType: RequestCurrency) {
	const sdk = createRaribleSdk(wallet, "dev")
	const bidAction = await sdk.order.bid({
		collectionId: toCollectionId("<COLLECTION_ADDRESS>"),
	})
	const bidOrderId = await bidAction.submit({
		amount: 1,
		price: "0.000002",
		currency: assetType,
		//+1 hour (optional)
		expirationDate: new Date(Date.now() + 60 * 60 * 1000),
	})
	return bidOrderId
}
