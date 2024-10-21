import { createRaribleSdk } from "@rarible/sdk"
import type { BlockchainWallet } from "@rarible/sdk-wallet"
import type { CreateCollectionRequestSimplified } from "@rarible/sdk/build/types/nft/deploy/simplified"

export async function createCollection(wallet: BlockchainWallet, collectionRequest: CreateCollectionRequestSimplified) {
  const sdk = createRaribleSdk(wallet, "testnet")
  const result = await sdk.nft.createCollection(collectionRequest)
  await result.tx.wait()
  return result.address
}
