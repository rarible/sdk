import { Blockchain } from "@rarible/api-client"
import { retry } from "@rarible/sdk-common"
import type { ContractAddress } from "@rarible/types"
import { toCollectionId } from "@rarible/types"
import type { IRaribleSdk } from "../../../../domain"

export async function createAndWaitForCollection(sdk: IRaribleSdk) {
  const randomId = Math.floor(Math.random() * 100_000_000)

  const response = await sdk.nft.createCollection({
    blockchain: Blockchain.APTOS,
    //Collection name must be unique
    name: `Aptos collection #${randomId}-${randomId}`,
    description: "",
    uri: "ipfs://QmWYpMyoaUGNRSQbwhw97xM8tcRWm4Et598qtzmzsau7ch/",
  })
  await response.tx.wait()
  await retry(20, 4000, () => sdk.apis.collection.getCollectionById({ collection: response.address }))
  return response.address
}

export async function mintAndWaitItem(sdk: IRaribleSdk, collection: ContractAddress) {
  const { itemId, transaction } = await sdk.nft.mint({
    uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
    collectionId: toCollectionId(collection),
  })
  await transaction.wait()
  return itemId
}

export async function createCollectionAndMint(sdk: IRaribleSdk) {
  const collection = await createAndWaitForCollection(sdk)
  const itemId = await mintAndWaitItem(sdk, collection)
  return { collection, itemId }
}
