import { createRaribleSdk } from "@rarible/sdk"
import {  toItemId } from "@rarible/types"
import type { BlockchainWallet } from "@rarible/sdk-wallet/src"

async function burnOnChainItem(wallet: BlockchainWallet) {
	const sdk = createRaribleSdk(wallet, "dev")
	const burnAction = await sdk.nft.burn({
		itemId: toItemId("<YOUR_ITEM_ID>"),
	})
	const tx = await burnAction.submit({ amount: 1 })
	if (tx) {
	  await tx.wait()
	}
}
