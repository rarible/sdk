import { createRaribleSdk } from "@rarible/sdk"
import { toItemId } from "@rarible/types"
import type { BlockchainWallet } from "@rarible/sdk-wallet"
import type { RequestCurrency } from "@rarible/sdk/build/common/domain"

export async function bid(wallet: BlockchainWallet, assetType: RequestCurrency) {
	const sdk = createRaribleSdk(wallet, "dev")
	const bidAction = await sdk.order.bid({
		itemId: toItemId("<ITEM_ID>"),
	})
	const bidOrderId = await bidAction.submit({
		amount: 1,
		price: "0.000002",
		currency: assetType,
	})

	const updateAction = await sdk.order.bidUpdate({
		orderId: bidOrderId,
	})
	//You can only increase price of bid order for security reasons
	//If you want to force change bid price you should cancel order
	await updateAction.submit({ price: "0.000003" })
}
