import { Web3Ethereum } from "@rarible/web3-ethereum"
import { EthereumWallet } from "@rarible/sdk-wallet"
import { Blockchain } from "@rarible/api-client"
import { createRaribleSdk } from "../../index"
import { LogsLevel } from "../../domain"
import { retry } from "../../common/retry"
import { initProviders } from "./test/init-providers"

describe.skip("create collection", () => {
	const { web31 } = initProviders()
	const ethereum1 = new Web3Ethereum({ web3: web31 })
	const ethereumWallet = new EthereumWallet(ethereum1)
	const sdk1 = createRaribleSdk(ethereumWallet, "development", { logs: LogsLevel.DISABLED })

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
