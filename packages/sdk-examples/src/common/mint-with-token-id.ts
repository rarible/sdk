import { createRaribleSdk } from "@rarible/sdk"
import { toCollectionId, toContractAddress, toUnionAddress } from "@rarible/types"
import type { BlockchainWallet } from "@rarible/sdk-wallet"

export async function mintOnChainWithTokenId(wallet: BlockchainWallet, contractAddress: string) {
  const sdk = createRaribleSdk(wallet, "testnet")

  const collectionId = toContractAddress(contractAddress)
  //Get tokenId for collection and mint
  const tokenId = await sdk.nft.generateTokenId({
    collection: collectionId,
    minter: toUnionAddress("<CREATOR_ADDRESS>"),
  })

  const mintResponse = await sdk.nft.mint({
    collectionId: toCollectionId(collectionId),
    tokenId,
    uri: "<YOUR_LINK_TO_JSON>",
    //optional
    royalties: [
      {
        account: toUnionAddress("<ROYLATY_ADDRESS>"),
        value: 1000,
      },
    ],
    //optional, by default creator=minter
    creators: [
      {
        account: toUnionAddress("<CREATOR_ADDRESS>"),
        value: 10000,
      },
    ],
    lazyMint: false,
    supply: 1,
  })
  /*
  You should upload json file with item metadata with the following format:
  {
    name: string
    description: string | undefined
    image: string | undefined
    "animation_url": string | undefined
    "external_url": string | undefined
    attributes: TokenMetadataAttribute[]
  }
  and insert link to json file to "uri" field.
  To format your json data use "sdk.nft.preprocessMeta()" method
   */

  await mintResponse.transaction.wait()
  return mintResponse.itemId
}
