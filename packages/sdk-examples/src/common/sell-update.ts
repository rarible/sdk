import { createRaribleSdk } from "@rarible/sdk"
import { toItemId, toUnionAddress } from "@rarible/types"
import type { BlockchainWallet } from "@rarible/sdk-wallet"
import type { RequestCurrency } from "@rarible/sdk/build/common/domain"

export async function sellAndUpdate(wallet: BlockchainWallet, assetType: RequestCurrency) {
	const sdk = createRaribleSdk(wallet, "dev")
	const sellAction = await sdk.order.sell({
		itemId: toItemId("<YOUR_ITEM_ID>"),
	})
	const sellOrderId = await sellAction.submit({
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
	})
	const updateAction = await sdk.order.sellUpdate({ orderId: sellOrderId })
	//You can only decrease price of sell order for security reasons
	//If you want to force change sell price you should cancel sell order
	await updateAction.submit({ price: "0.000001" })
}
