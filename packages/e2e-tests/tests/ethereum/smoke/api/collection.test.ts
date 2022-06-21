import { Blockchain } from "@rarible/api-client"
import type { BlockchainWallet } from "@rarible/sdk-wallet"
import type {
	GetAllCollections200,
	GetCollectionsByOwner200,
} from "@rarible/api-client/build/apis/CollectionControllerApi"
import type { CreateCollectionRequest } from "@rarible/sdk/src/types/nft/deploy/domain"
import { getEthereumWallet, getWalletAddressFull } from "../../../common/wallet"
import { createSdk } from "../../../common/create-sdk"
import {
	getAllCollections,
	getAllCollectionsRaw,
	getCollectionById,
	getCollectionByIdRaw,
	getCollectionsByOwner,
	getCollectionsByOwnerRaw,
} from "../../../common/api-helpers/collection-helper"
import { createCollection } from "../../../common/atoms-tests/create-collection"


function suites(): {
	blockchain: Blockchain,
	wallet: BlockchainWallet,
	deployRequest: CreateCollectionRequest
}[] {
	return [
		{
			blockchain: Blockchain.ETHEREUM,
			wallet: getEthereumWallet(),
			deployRequest: {
				blockchain: Blockchain.ETHEREUM,
				asset: {
					assetType: "ERC721",
					arguments: {
						name: "erc721",
						symbol: "rari",
						baseURI: "https://ipfs.rarible.com",
						contractURI: "https://ipfs.rarible.com",
						isUserToken: false,
					},
				},
			} as CreateCollectionRequest,
		},
	]
}

describe.each(suites())("$blockchain api => collection", (suite) => {
	const wallet = suite.wallet
	const sdk = createSdk(suite.blockchain, wallet)

	test("collection controller", async () => {

		const { address } = await createCollection(sdk, wallet, suite.deployRequest)

		const walletAddress = await getWalletAddressFull(wallet)

		await getCollectionById(sdk, address)

		await getCollectionByIdRaw(sdk, address)

		const actualAllCollections = await getAllCollections(sdk, [suite.blockchain], 2)
		expect(actualAllCollections.collections.length).toBeGreaterThanOrEqual(1)

		const actualAllCollectionsRaw = await getAllCollectionsRaw(sdk, [suite.blockchain], 2) as GetAllCollections200
		expect(actualAllCollectionsRaw.value.collections.length).toBeGreaterThanOrEqual(1)

		const actualCollectionsByOwner = await getCollectionsByOwner(sdk, walletAddress.unionAddress, 2)
		expect(actualCollectionsByOwner.collections.length).toBeGreaterThanOrEqual(1)

		const actualCollectionsByOwnerRaw =
            await getCollectionsByOwnerRaw(sdk, walletAddress.unionAddress, 2) as GetCollectionsByOwner200
		expect(actualCollectionsByOwnerRaw.value.collections.length).toBeGreaterThanOrEqual(1)
	})
})
