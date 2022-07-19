import { ActivityType, Blockchain } from "@rarible/api-client"
import type { UnionAddress } from "@rarible/types"
import type { CreateCollectionRequest } from "@rarible/sdk/src/types/nft/deploy/domain"
import type { MintRequest } from "@rarible/sdk/build/types/nft/mint/mint-request.type"
import type { BlockchainWallet } from "@rarible/sdk-wallet"
import { retry } from "@rarible/sdk/src/common/retry"
import { getEthereumWallet, getWalletAddressFull } from "../../../common/wallet"
import { createSdk } from "../../../common/create-sdk"
import { mint } from "../../../common/atoms-tests/mint"
import { getCollection } from "../../../common/helpers"
import { createCollection } from "../../../common/atoms-tests/create-collection"
import { getActivitiesByItem } from "../../../common/api-helpers/activity-helper"
import {
	getAllCollections, getCollectionsByOwner, verifyCollectionsByBlockchain,
	verifyCollectionsContainsCollection, verifyCollectionsOwner,
} from "../../../common/api-helpers/collection-helper"

function suites(): {
	blockchain: Blockchain,
	description: string,
	wallet: BlockchainWallet,
	deployRequest: CreateCollectionRequest,
	mintRequest: (address: UnionAddress) => MintRequest,
	activities: Array<ActivityType>
}[] {
	return [
		{
			blockchain: Blockchain.ETHEREUM,
			description: "ERC721",
			wallet: getEthereumWallet(),
			deployRequest: {
				blockchain: Blockchain.ETHEREUM,
				asset: {
					assetType: "ERC721",
					arguments: {
						name: "name",
						symbol: "RARI",
						baseURI: "https://ipfs.rarible.com",
						contractURI: "https://ipfs.rarible.com",
						isUserToken: false,
					},
				},
			} as CreateCollectionRequest,
			mintRequest: (walletAddress: UnionAddress) => {
				return {
					uri: "ipfs:/test",
					creators: [{
						account: walletAddress,
						value: 10000,
					}],
					royalties: [],
					lazyMint: false,
					supply: 1,
				}
			},
			activities: [ActivityType.MINT],
		},
		{
			blockchain: Blockchain.ETHEREUM,
			description: "ERC721_lazy",
			wallet: getEthereumWallet(),
			deployRequest: {
				blockchain: Blockchain.ETHEREUM,
				asset: {
					assetType: "ERC721",
					arguments: {
						name: "name",
						symbol: "RARI",
						baseURI: "https://ipfs.rarible.com",
						contractURI: "https://ipfs.rarible.com",
						isUserToken: false,
						operators: [],
					},
				},
			} as CreateCollectionRequest,
			mintRequest: (walletAddress: UnionAddress) => {
				return {
					uri: "ipfs:/test",
					creators: [{
						account: walletAddress,
						value: 10000,
					}],
					royalties: [],
					lazyMint: true,
					supply: 1,
				}
			},
			activities: [],
		},
		{
			blockchain: Blockchain.ETHEREUM,
			description: "ERC1155",
			wallet: getEthereumWallet(),
			deployRequest: {
				blockchain: Blockchain.ETHEREUM,
				asset: {
					assetType: "ERC1155",
					arguments: {
						name: "name",
						symbol: "RARI",
						baseURI: "https://ipfs.rarible.com",
						contractURI: "https://ipfs.rarible.com",
						isUserToken: false,
					},
				},
			} as CreateCollectionRequest,
			mintRequest: (walletAddress: UnionAddress) => {
				return {
					uri: "ipfs:/test",
					creators: [{
						account: walletAddress,
						value: 10000,
					}],
					royalties: [],
					lazyMint: false,
					supply: 14,
				}
			},
			activities: [ActivityType.MINT],
		},
		{
			blockchain: Blockchain.ETHEREUM,
			description: "ERC1155_lazy",
			wallet: getEthereumWallet(),
			deployRequest: {
				blockchain: Blockchain.ETHEREUM,
				asset: {
					assetType: "ERC1155",
					arguments: {
						name: "name",
						symbol: "RARI",
						baseURI: "https://ipfs.rarible.com",
						contractURI: "https://ipfs.rarible.com",
						isUserToken: true,
						operators: [],
					},
				},
			} as CreateCollectionRequest,
			mintRequest: (walletAddress: UnionAddress) => {
				return {
					uri: "ipfs:/test",
					creators: [{
						account: walletAddress,
						value: 10000,
					}],
					royalties: [],
					lazyMint: true,
					supply: 14,
				}
			},
			activities: [],
		},
	]
}

describe.each(suites()/*.filter((t) => t.description === "ERC1155")*/)("$blockchain deploy => mint", (suite) => {
	const wallet = suite.wallet
	const sdk = createSdk(suite.blockchain, wallet)

	test(suite.description, async () => {
		const walletAddress = await getWalletAddressFull(wallet)
		const { address } = await createCollection(sdk, wallet, suite.deployRequest)
		const collection = await getCollection(sdk, address)

		await retry(5, 2000, async () => {
			const collectionsAll = await getAllCollections(sdk, [suite.blockchain], 10)
			await verifyCollectionsByBlockchain(collectionsAll, suite.blockchain)
			await verifyCollectionsContainsCollection(collectionsAll, address)
		})

		await retry(5, 2000, async () => {
			const collectionsByOwner = await getCollectionsByOwner(sdk, walletAddress.unionAddress, 10)
			await verifyCollectionsByBlockchain(collectionsByOwner, suite.blockchain)
			await verifyCollectionsOwner(collectionsByOwner, walletAddress.unionAddress)
			await verifyCollectionsContainsCollection(collectionsByOwner, address)
		})

		const { nft } = await mint(sdk, wallet, { collection },
			suite.mintRequest(walletAddress.unionAddress)
		)

		await getActivitiesByItem(sdk, nft.id, [ActivityType.MINT], suite.activities)
	})
})
