import type {
	GetItemRoyaltiesById200,
	GetItemsByCollection200,
	GetItemsByCreator200,
	GetItemsByOwner200,
} from "@rarible/api-client"
import {
	Blockchain,
} from "@rarible/api-client"
import type { BlockchainWallet } from "@rarible/sdk-wallet"
import type { UnionAddress } from "@rarible/types"
import { toBigNumber } from "@rarible/types"
import type { MintRequest } from "@rarible/sdk/build/types/nft/mint/mint-request.type"
import type { GetAllItems200 } from "@rarible/api-client/build/apis/ItemControllerApi"
import { getEthereumWallet, getWalletAddressFull } from "../../../common/wallet"
import { testsConfig } from "../../../common/config"
import { createSdk } from "../../../common/create-sdk"
import { mint } from "../../../common/atoms-tests/mint"
import { awaitForItemSupply, getCollection } from "../../../common/helpers"
import {
	awaitForOwnershipValue,
} from "../../../common/api-helpers/ownership-helper"
import {
	getAllItems,
	getAllItemsRaw,
	getItemByIdRaw, getItemRoyaltiesById, getItemRoyaltiesByIdRaw,
	getItemsByCollection,
	getItemsByCollectionRaw,
	getItemsByCreator,
	getItemsByCreatorRaw,
	getItemsByOwner,
	getItemsByOwnerRaw,
} from "../../../common/api-helpers/item-helper"


function suites(): {
	blockchain: Blockchain,
	wallet: BlockchainWallet,
	collectionId: string,
	mintRequest: (address: UnionAddress) => MintRequest,
}[] {
	return [
		{
			blockchain: Blockchain.ETHEREUM,
			wallet: getEthereumWallet(),
			collectionId: testsConfig.variables.ETHEREUM_COLLECTION_ERC_1155,
			mintRequest: (walletAddress: UnionAddress): MintRequest => {
				return {
					uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG1",
					creators: [{
						account: walletAddress,
						value: 10000,
					}],
					royalties: [],
					lazyMint: false,
					supply: 50,
				}
			},
		},
	]
}

describe.each(suites())("$blockchain api => ownership", (suite) => {
	const wallet = suite.wallet
	const sdk = createSdk(suite.blockchain, wallet)

	test("item controller", async () => {
		const address = await getWalletAddressFull(wallet)
		const collection = await getCollection(sdk, suite.collectionId)
		const { nft } = await mint(sdk, wallet, { collection },
			suite.mintRequest(address.unionAddress))

		await awaitForOwnershipValue(sdk, nft.id, address.address, toBigNumber(String(50)))

		await awaitForItemSupply(sdk, nft.id, toBigNumber(String(50)))

		await getItemByIdRaw(sdk, nft.id)

		const allItems = await getAllItems(sdk, [suite.blockchain], 2)
		expect(allItems.items.length).toBeGreaterThanOrEqual(1)

		const allItemsRaw = await getAllItemsRaw(sdk, [suite.blockchain], 2) as GetAllItems200
		expect(allItemsRaw.value.items.length).toBeGreaterThanOrEqual(1)

		const itemsByCollection = await getItemsByCollection(sdk, collection.id, 2)
		expect(itemsByCollection.items.length).toBeGreaterThanOrEqual(1)

		const itemsByCollectionRaw =
            await getItemsByCollectionRaw(sdk, collection.id, 2) as GetItemsByCollection200
		expect(itemsByCollectionRaw.value.items.length).toBeGreaterThanOrEqual(1)

		const itemsByCreator = await getItemsByCreator(sdk, address.unionAddress, 2)
		expect(itemsByCreator.items.length).toBeGreaterThanOrEqual(1)

		const itemsByCreatorRaw =
            await getItemsByCreatorRaw(sdk, address.unionAddress, 2) as GetItemsByCreator200
		expect(itemsByCreatorRaw.value.items.length).toBeGreaterThanOrEqual(1)

		const itemsByOwner = await getItemsByOwner(sdk, address.unionAddress, 2)
		expect(itemsByOwner.items.length).toBeGreaterThanOrEqual(1)

		const itemsByOwnerRaw =
            await getItemsByOwnerRaw(sdk, address.unionAddress, 2) as GetItemsByOwner200
		expect(itemsByOwnerRaw.value.items.length).toBeGreaterThanOrEqual(1)

		const itemRoyalties = await getItemRoyaltiesById(sdk, nft.contract!, nft.tokenId!)
		expect(itemRoyalties.royalties.length).toBeGreaterThanOrEqual(0)

		const itemRoyaltiesRaw =
            await getItemRoyaltiesByIdRaw(sdk, nft.contract!, nft.tokenId!) as GetItemRoyaltiesById200
		expect(itemRoyaltiesRaw.value.royalties.length).toBeGreaterThanOrEqual(0)
	})
})
