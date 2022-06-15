import { createRaribleSdk } from "@rarible/sdk"
import { toItemId, toUnionAddress } from "@rarible/types"
import type { BlockchainWallet } from "@rarible/sdk-wallet"
import type { RequestCurrency } from "@rarible/sdk/build/common/domain"

export async function mintOnChain(wallet: BlockchainWallet, assetType: RequestCurrency) {
	const sdk = createRaribleSdk(wallet, "dev")
	const sellResponse = await sdk.order.sell({
		itemId: toItemId("<YOUR_ITEM_ID>"),
	})
	const sellOrderId = await sellResponse.submit({
		amount: 1,
		price: "0.000002",
		currency: assetType,
		originFees: [{
			account: toUnionAddress("<COMISSION_ADDRESS>"),
			//2,5%
			value: 250,
		}],
		payouts: [{
			account: toUnionAddress("<PAYOUT_ADDRESS>"),
			//5%
			value: 500,
		}],
		//+1 hour
		expirationDate: new Date(Date.now() + 60 * 60 * 1000),
	})
	return sellOrderId
}
