import { createRaribleSdk } from "@rarible/sdk/node"
import { toItemId, toUnionAddress } from "@rarible/types"
import type { BlockchainWallet } from "@rarible/sdk-wallet"

export async function burn(wallet: BlockchainWallet) {
	const sdk = await createRaribleSdk(wallet, "testnet")

	const burnTx = await sdk.nft.burn({
		itemId: toItemId("<ITEM_ID>"),
		amount: 1,
		//optional
		creators: [{
			account: toUnionAddress("<CREATOR_ADDRESS>"),
			value: 10000,
		}],
	})
	//transaction returned if item is on-chain
	if (burnTx) {
		await burnTx.wait()
	}
}
