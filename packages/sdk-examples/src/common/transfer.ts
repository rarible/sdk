import { createRaribleSdk } from "@rarible/sdk"
import { toItemId, toUnionAddress } from "@rarible/types"
import type { BlockchainWallet } from "@rarible/sdk-wallet"

export async function transferItem(wallet: BlockchainWallet) {
	const sdk = createRaribleSdk(wallet, "dev")
	const transferAction = await sdk.nft.transfer({
		itemId: toItemId("<YOUR_ITEM_ID>"),
	})
	const tx = await transferAction.submit({
		to: toUnionAddress("<ITEM_RECIPIENT>"),
		amount: 1,
	})
	await tx.wait()
}
