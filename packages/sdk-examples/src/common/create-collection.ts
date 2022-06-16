import { createRaribleSdk } from "@rarible/sdk"
import type { BlockchainWallet } from "@rarible/sdk-wallet"
import type { CreateCollectionRequest } from "@rarible/sdk/src/types/nft/deploy/domain"

export async function createCollection(wallet: BlockchainWallet, collectionRequest: CreateCollectionRequest) {
	const sdk = createRaribleSdk(wallet, "dev")
	const result = await sdk.nft.createCollection(collectionRequest)
	await result.tx.wait()
	return result.address
}
