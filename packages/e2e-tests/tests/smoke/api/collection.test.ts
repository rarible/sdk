import type {
	Collection } from "@rarible/api-client"
import {
	Blockchain,
	CollectionFeatures,
	CollectionType,
} from "@rarible/api-client"
import type { BlockchainWallet } from "@rarible/sdk-wallet"
import type { GetAllCollections200, GetCollectionsByOwner200 } from "@rarible/api-client/build/apis/CollectionControllerApi"
import type { UnionAddress } from "@rarible/types"
import { toContractAddress } from "@rarible/types"
import { getTezosTestWallet, getWalletAddressFull } from "../../common/wallet"
import { testsConfig } from "../../common/config"
import { createSdk } from "../../common/create-sdk"
import {
	getAllCollections,
	getAllCollectionsRaw,
	getCollectionById,
	getCollectionByIdRaw,
	getCollectionsByOwner,
	getCollectionsByOwnerRaw,
} from "../../common/api-helpers/collection-helper"


function suites(): {
	blockchain: Blockchain,
	wallet: BlockchainWallet,
	collectionId: string,
	expectedCollection: (owner: UnionAddress) => Collection,
}[] {
	let allBlockchains = [
		{
			blockchain: Blockchain.TEZOS,
			wallet: getTezosTestWallet(0),
			collectionId: testsConfig.variables.TEZOS_COLLECTION_ID_NFT,
			expectedCollection: (owner: UnionAddress): Collection => {
				return {
					id: toContractAddress(testsConfig.variables.TEZOS_COLLECTION_ID_NFT),
					blockchain: Blockchain.TEZOS,
					type: CollectionType.TEZOS_NFT,
					name: "NFT",
					symbol: "AUTO_NFT",
					owner: owner,
					features: [CollectionFeatures.SECONDARY_SALE_FEES, CollectionFeatures.BURN],
					minters: [owner],
				}
			},
		},
	]
	return allBlockchains.filter(b => testsConfig.blockchain?.includes(b.blockchain))
}

describe.each(suites())("$blockchain api => collection", (suite) => {
	const wallet = suite.wallet
	const sdk = createSdk(suite.blockchain, wallet)

	test("collection controller", async () => {
		const address = await getWalletAddressFull(wallet)

		const actualCollection = await getCollectionById(sdk, suite.collectionId)
		expect(actualCollection).toEqual(suite.expectedCollection(address.unionAddress))

		const actualCollectionRaw = await getCollectionByIdRaw(sdk, suite.collectionId)
		expect(actualCollectionRaw.value).toEqual(suite.expectedCollection(address.unionAddress))

		const actualAllCollections = await getAllCollections(sdk, suite.blockchain, 2)
		expect(actualAllCollections.collections).toHaveLength(2)

		const actualAllCollectionsRaw = await getAllCollectionsRaw(sdk, suite.blockchain, 2) as GetAllCollections200
		expect(actualAllCollectionsRaw.value.collections).toHaveLength(2)

		const actualCollectionsByOwner = await getCollectionsByOwner(sdk, address.unionAddress, 2)
		expect(actualCollectionsByOwner.collections).toHaveLength(2)

		const actualCollectionsByOwnerRaw =
        await getCollectionsByOwnerRaw(sdk, address.unionAddress, 2) as GetCollectionsByOwner200
		expect(actualCollectionsByOwnerRaw.value.collections).toHaveLength(2)
	})
})
