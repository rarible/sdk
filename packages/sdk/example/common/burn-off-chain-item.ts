import { createRaribleSdk } from "@rarible/sdk"
import {  toItemId } from "@rarible/types"
import type { BlockchainWallet } from "@rarible/sdk-wallet/src"

async function burnOffChainItem(wallet: BlockchainWallet) {
	const sdk = createRaribleSdk(wallet, "dev")
	const burnAction = await sdk.nft.burn({
		itemId: toItemId("<YOUR_ITEM_ID>"),
	})
	await burnAction.submit({ amount: 1 })
}
