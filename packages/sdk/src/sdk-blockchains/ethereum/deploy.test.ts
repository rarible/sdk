import { Web3Ethereum } from "@rarible/web3-ethereum"
import { EthereumWallet } from "@rarible/sdk-wallet"
import { Blockchain } from "@rarible/api-client"
import { createRaribleSdk } from "../../index"
import { LogsLevel } from "../../domain"
import { initProviders } from "./test/init-providers"

describe("deploy", () => {
	const { web31 } = initProviders()
	const ethereum1 = new Web3Ethereum({ web3: web31 })
	const ethereumWallet = new EthereumWallet(ethereum1)
	const sdk1 = createRaribleSdk(ethereumWallet, "e2e", { logs: LogsLevel.DISABLED })

	test("deploy erc-721 collection", async () => {
		await sdk1.nft.deploy({
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
	})

	test("deploy erc-721 user collection", async () => {
		await sdk1.nft.deploy({
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
	})

	test("deploy erc-1155 collection", async () => {
		await sdk1.nft.deploy({
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
	})

	test("deploy erc-1155 user collection", async () => {
		await sdk1.nft.deploy({
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
	})

})
