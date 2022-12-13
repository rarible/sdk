import { createRaribleSdk } from "@rarible/sdk/node"
import { toItemId, toUnionAddress } from "@rarible/types"
import type { BlockchainWallet } from "@rarible/sdk-wallet"
import type { RequestCurrency } from "@rarible/sdk/node"

export async function mintOnChain(wallet: BlockchainWallet, assetType: RequestCurrency) {
	const sdk = await createRaribleSdk(wallet, "testnet")
	const sellOrderId = await sdk.order.sell({
		itemId: toItemId("<YOUR_ITEM_ID>"),
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
