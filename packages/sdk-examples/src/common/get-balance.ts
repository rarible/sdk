import type { RequestCurrency } from "@rarible/sdk/node"
import { createRaribleSdk } from "@rarible/sdk/node"
import { toUnionAddress } from "@rarible/types"
import type { BlockchainWallet } from "@rarible/sdk-wallet"

export async function getBalance(wallet: BlockchainWallet, assetType: RequestCurrency) {
	const sdk = await createRaribleSdk(wallet, "testnet")
	const balance = await sdk.balances.getBalance(
		toUnionAddress("<YOUR_WALLET_ADDRESS>"),
		assetType
	)
	return balance
}
