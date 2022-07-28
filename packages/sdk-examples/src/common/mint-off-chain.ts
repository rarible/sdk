import { createRaribleSdk } from "@rarible/sdk"
import { toCollectionId, toUnionAddress } from "@rarible/types"
import type { BlockchainWallet } from "@rarible/sdk-wallet"
import { MintType } from "@rarible/sdk/build/types/nft/mint/domain"

export async function mintOffChain(wallet: BlockchainWallet, contractAddress: string) {
	const sdk = createRaribleSdk(wallet, "testnet")

	const mintAction = await sdk.nft.mint({
		collectionId: toCollectionId(contractAddress),
	})
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
	const mintResult = await mintAction.submit({
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
	})
	if (mintResult.type === MintType.OFF_CHAIN) {
		return mintResult.itemId
	}
}
