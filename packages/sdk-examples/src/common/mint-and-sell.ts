import type { RequestCurrency } from "@rarible/sdk/node"
import { createRaribleSdk } from "@rarible/sdk/node"
import { toCollectionId, toUnionAddress } from "@rarible/types"
import type { BlockchainWallet } from "@rarible/sdk-wallet"

export async function mintAndSell(wallet: BlockchainWallet, currency: RequestCurrency) {
	const sdk = await createRaribleSdk(wallet, "testnet")

	/*
    You should upload json file with item metadata in the following format:
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
	const mintResult = await sdk.nft.mintAndSell({
		collectionId: toCollectionId("<NFT_CONTRACT_ADDRESS>"),
		uri: "<YOUR_LINK_TO_JSON>",
		royalties: [{
			account: toUnionAddress("<ROYLATY_ADDRESS>"),
			value: 1000,
		}],
		creators: [{
			account: toUnionAddress("<CREATOR_ADDRESS>"),
			value: 10000,
		}],
		lazyMint: true,
		supply: 1,
		price: "0.000000000000000001",
		currency,
	})
	return mintResult.itemId
}
