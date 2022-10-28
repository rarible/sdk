import { createRaribleSdk } from "@rarible/sdk/node"
import type { BlockchainWallet } from "@rarible/sdk-wallet"
import type { CreateCollectionRequestSimplified } from "@rarible/sdk/node/types/nft/deploy/simplified"

export async function createCollection(wallet: BlockchainWallet, collectionRequest: CreateCollectionRequestSimplified) {
	const sdk = await createRaribleSdk(wallet, "testnet")
	const result = await sdk.nft.createCollection(collectionRequest)
	await result.tx.wait()
	return result.address
}
