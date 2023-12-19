import type { CollectionId, ItemId } from "@rarible/types"
import { toUnionAddress } from "@rarible/types"
import type { IRaribleSdk } from "../../domain"
import type { MintSimplifiedRequestOffChain, MintSimplifiedRequestOnChain } from "../../types/nft/mint/simplified"
import { toBlockchainGroup } from "../extract-blockchain"
import { waitFor } from "../wait-for"
import type { SuiteSupportedBlockchain, TestSuiteProviderDictionary } from "./domain"

export class ItemTestSuite<T extends SuiteSupportedBlockchain> {
	constructor(
		private readonly blockchain: T,
		private readonly sdk: IRaribleSdk,
		private readonly provider: TestSuiteProviderDictionary[T],
	) {}

	mintAndWait = async (
		collectionId: CollectionId,
		override: Partial<MintSimplifiedRequestOnChain> = {},
	) => {
		const common = await this.createDefaultMintValues(this.blockchain, collectionId)
		const config: MintSimplifiedRequestOnChain = {
			lazyMint: false,
			...common,
			...override,
		}
		const result = await this.sdk.nft.mint(config)
		await result.transaction.wait()
		await this.waitItem(result.itemId, config.supply)

		return result
	}

    waitItem = (itemId: ItemId, supply: number | undefined) => {
    	return waitFor(() => this.sdk.apis.item.getItemById({ itemId }), x => {
    		if (supply) return x.supply.toString() === supply.toString()
    		return false
    	})
    }

    mintLazyAndWait = async (
    	collectionId: CollectionId,
    	override: Partial<MintSimplifiedRequestOffChain> = {},
    ) => {
    	const common = await this.createDefaultMintValues(this.blockchain, collectionId)
    	const config: MintSimplifiedRequestOffChain = {
    		lazyMint: true,
    		...common,
    		...override,
    	}

    	const result = await this.sdk.nft.mint(config)
    	await this.waitItem(result.itemId, config.supply)
    	return result
    }

    private async createDefaultMintValues<T extends SuiteSupportedBlockchain>(
    	blockchain: T,
    	collectionId: CollectionId
    ) {
    	const creatorAddressString = await this.provider.getFrom()
    	const blockchainGroup = toBlockchainGroup(blockchain)
    	const creatorAddress = toUnionAddress(`${blockchainGroup}:${creatorAddressString}`)

    	return {
    		uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
    		collectionId,
    		creators: [{
    			account: creatorAddress,
    			value: 10000,
    		}],
    		royalties: [],
    		supply: 1,
    	}
    }
}