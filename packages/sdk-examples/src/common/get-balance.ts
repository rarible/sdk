import type { RequestCurrency } from "@rarible/sdk"
import { createRaribleSdk } from "@rarible/sdk"
import { toUnionAddress } from "@rarible/types"
import type { BlockchainWallet } from "@rarible/sdk-wallet"

export async function getBalance(wallet: BlockchainWallet, assetType: RequestCurrency) {
	const sdk = createRaribleSdk(wallet, "dev")
	const balance = await sdk.balances.getBalance(
		toUnionAddress("<YOUR_WALLET_ADDRESS>"),
		assetType
	)
	return balance
}
