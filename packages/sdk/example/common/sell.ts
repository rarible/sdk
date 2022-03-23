import { createRaribleSdk } from "@rarible/sdk"
import { toItemId } from "@rarible/types"
import type { BlockchainWallet } from "@rarible/sdk-wallet/src"
import type { RequestCurrency } from "@rarible/sdk/build/common/domain"

async function mintOnChain(wallet: BlockchainWallet, assetType: RequestCurrency) {
	const sdk = createRaribleSdk(wallet, "dev")
	const sellAction = await sdk.order.sell({
		itemId: toItemId("<YOUR_ITEM_ID>"),
	})
	const sellOrderId = await sellAction.submit({
		amount: 1,
		price: "0.000002",
		currency: assetType,
	})
	return sellOrderId
}
