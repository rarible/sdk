import { createRaribleSdk } from "@rarible/sdk"
import { toOrderId, toUnionAddress } from "@rarible/types"
import type { BlockchainWallet } from "@rarible/sdk-wallet"

export async function acceptBid(wallet: BlockchainWallet) {
	const sdk = createRaribleSdk(wallet, "dev")
	const acceptBidResponse = await sdk.order.acceptBid({
		orderId: toOrderId("<BIDDER_ORDER_ID>"),
	})
	const acceptBidResult = await acceptBidResponse.submit({
		amount: 1,
		//optional
		originFees: [{
			account: toUnionAddress("<COMISSION_ADDRESS>"),
			//2,5%
			value: 250,
		}],
		//optional
		payouts: [{
			account: toUnionAddress("<PAYOUT_ADDRESS>"),
			//5%
			value: 500,
		}],
		//optional
		infiniteApproval: true,
		//Set true if you want to convert received WETH/wTEZ tokens to ETH/TEZ
		unwrap: false,
	})
	await acceptBidResult.wait()
}
