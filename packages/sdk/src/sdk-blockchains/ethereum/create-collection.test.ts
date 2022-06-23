import { Web3Ethereum } from "@rarible/web3-ethereum"
import { EthereumWallet } from "@rarible/sdk-wallet"
import { Blockchain } from "@rarible/api-client"
import { toCollectionId } from "@rarible/types"
import { createRaribleSdk } from "../../index"
import { LogsLevel } from "../../domain"
import { retry } from "../../common/retry"
import { initProviders } from "./test/init-providers"

describe("create collection", () => {
	const { web31, web32 } = initProviders()
	const ethereum1 = new Web3Ethereum({ web3: web31 })
	const ethereum2 = new Web3Ethereum({ web3: web32 })
	const ethereumWallet1 = new EthereumWallet(ethereum1)
	const ethereumWallet2 = new EthereumWallet(ethereum2)
	const sdk1 = createRaribleSdk(ethereumWallet1, "development", { logs: LogsLevel.DISABLED })
	const sdk2 = createRaribleSdk(ethereumWallet2, "development", { logs: LogsLevel.DISABLED })

	test("create erc-721 collection legacy", async () => {
		const { address, tx } = await sdk1.nft.createCollection({
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
		})
		await tx.wait()
		console.log(address)
		await retry(5, 2000, async () => {
			return sdk1.apis.collection.getCollectionById({
				collection: address,
			})
		})
	})

	test("create erc-721 collection", async () => {
		const { address, tx } = await sdk1.nft.createCollection({
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
		})
		await tx.wait()
		await retry(5, 2000, async () => {
			return sdk1.apis.collection.getCollectionById({
				collection: address,
			})
		})
	})

	test("create erc-721 collection with basic function", async () => {
		const { address, tx } = await sdk1.nftBasic.createCollection({
			blockchain: Blockchain.ETHEREUM,
			type: "ERC721",
			name: "name",
			symbol: "RARI",
			baseURI: "https://ipfs.rarible.com",
			contractURI: "https://ipfs.rarible.com",
			isPublic: true,
		})
		await tx.wait()
		await retry(5, 2000, async () => {
			return sdk1.apis.collection.getCollectionById({
				collection: address,
			})
		})
		//check if collection is public
		const mintTx = await sdk2.nftBasic.mint({
			collectionId: toCollectionId(address),
			uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
		})
		await mintTx.transaction.wait()
	})

	test("create erc-721 user collection", async () => {
		const { address, tx } = await sdk1.nft.createCollection({
			blockchain: Blockchain.ETHEREUM,
			asset: {
				assetType: "ERC721",
				arguments: {
					name: "name",
					symbol: "RARI",
					baseURI: "https://ipfs.rarible.com",
					contractURI: "https://ipfs.rarible.com",
					isUserToken: true,
					operators: [],
				},
			},
		})
		await tx.wait()
		await retry(5, 2000, async () => {
			return sdk1.apis.collection.getCollectionById({
				collection: address,
			})
		})
	})

	test("create erc-1155 collection", async () => {
		const { address, tx } = await sdk1.nft.createCollection({
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
		})
		await tx.wait()
		await retry(5, 2000, async () => {
			return sdk1.apis.collection.getCollectionById({
				collection: address,
			})
		})
	})

	test("create erc-1155 user collection", async () => {
		const { address, tx } = await sdk1.nft.createCollection({
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
		})
		await tx.wait()
		await retry(5, 2000, async () => {
			return sdk1.apis.collection.getCollectionById({
				collection: address,
			})
		})
	})

})
