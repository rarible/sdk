import { createRaribleSdk } from "@rarible/sdk/node"
import { toItemId, toUnionAddress } from "@rarible/types"
import type { BlockchainWallet } from "@rarible/sdk-wallet"

export async function transferItem(wallet: BlockchainWallet) {
	const sdk = await createRaribleSdk(wallet, "testnet")
	const tx = await sdk.nft.transfer({
		itemId: toItemId("<YOUR_ITEM_ID>"),
		to: toUnionAddress("<ITEM_RECIPIENT>"),
		amount: 1,
	})
	await tx.wait()
}
