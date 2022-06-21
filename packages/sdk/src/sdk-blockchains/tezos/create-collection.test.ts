import { Blockchain } from "@rarible/api-client"
import { createRaribleSdk } from "../../index"
import { LogsLevel } from "../../domain"
import { awaitForCollection } from "./test/await-for-collection"
import { createTestWallet } from "./test/test-wallet"

describe("deploy tezos tests", () => {
	const wallet = createTestWallet(
		"edskRqrEPcFetuV7xDMMFXHLMPbsTawXZjH9yrEz4RBqH1" +
    "D6H8CeZTTtjGA3ynjTqD8Sgmksi7p5g3u5KUEVqX2EWrRnq5Bymj"
	)
	const sdk = createRaribleSdk(wallet, "development", { logs: LogsLevel.DISABLED })

	test("deploy public nft", async () => {
		const result = await sdk.nft.createCollection({
			blockchain: Blockchain.TEZOS,
			asset: {
				assetType: "NFT",
				arguments: {
					name: "My NFT collection",
					symbol: "MYNFT",
					contractURI: "https://ipfs.io/ipfs/QmTKxwnqqxTxH4HE3UVM9yoJFZgbsZ8CuqqRFZCSWBF53m",
					isUserToken: false,
				},
			},
		})
		await result.tx.wait()
	})

	test("deploy public nft with simplified function createCollectionStart", async () => {
		const result = await sdk.nftBasic.createCollection({
			blockchain: Blockchain.TEZOS,
			type: "NFT",
			name: "My NFT collection",
			symbol: "MYNFT",
			contractURI: "https://ipfs.io/ipfs/QmTKxwnqqxTxH4HE3UVM9yoJFZgbsZ8CuqqRFZCSWBF53m",
			isPublic: true,
		})

		await result.tx.wait()
		expect(result.tx).toBeTruthy()
		expect(result.address).toBeTruthy()
		await awaitForCollection(sdk, result.address)
	})

	test.skip("deploy private nft", async () => {
		const result = await sdk.nft.createCollection({
			blockchain: Blockchain.TEZOS,
			asset: {
				assetType: "NFT",
				arguments: {
					name: "My NFT collection",
					symbol: "MYNFT",
					contractURI: "https://ipfs.io/ipfs/QmTKxwnqqxTxH4HE3UVM9yoJFZgbsZ8CuqqRFZCSWBF53m",
					isUserToken: true,
				},
			},
		})

		await result.tx.wait()

		await awaitForCollection(sdk, result.address)
	})


	test("deploy private nft with simplified function createCollectionStart", async () => {
		const result = await sdk.nftBasic.createCollection({
			blockchain: Blockchain.TEZOS,
			type: "NFT",
			name: "My NFT collection",
			symbol: "MYNFT",
			contractURI: "https://ipfs.io/ipfs/QmTKxwnqqxTxH4HE3UVM9yoJFZgbsZ8CuqqRFZCSWBF53m",
			isPublic: false,
		})

		await result.tx.wait()
		expect(result.tx).toBeTruthy()
		expect(result.address).toBeTruthy()
		await awaitForCollection(sdk, result.address)
	})

	test("deploy public mt", async () => {
		const result = await sdk.nft.createCollection({
			blockchain: Blockchain.TEZOS,
			asset: {
				assetType: "MT",
				arguments: {
					name: "My NFT collection",
					symbol: "MYNFT",
					contractURI: "https://ipfs.io/ipfs/QmTKxwnqqxTxH4HE3UVM9yoJFZgbsZ8CuqqRFZCSWBF53m",
					isUserToken: false,
				},
			},
		})

		await result.tx.wait()
		await awaitForCollection(sdk, result.address)
	})

	test("deploy public MT with simplified function createCollectionStart", async () => {
		const result = await sdk.nftBasic.createCollection({
			blockchain: Blockchain.TEZOS,
			type: "MT",
			name: "My NFT collection",
			symbol: "MYNFT",
			contractURI: "https://ipfs.io/ipfs/QmTKxwnqqxTxH4HE3UVM9yoJFZgbsZ8CuqqRFZCSWBF53m",
			isPublic: true,
		})

		await result.tx.wait()
		expect(result.tx).toBeTruthy()
		expect(result.address).toBeTruthy()
		await awaitForCollection(sdk, result.address)
	})

	test.skip("deploy private mt", async () => {
		const result = await sdk.nft.createCollection({
			blockchain: Blockchain.TEZOS,
			asset: {
				assetType: "MT",
				arguments: {
					name: "My NFT collection",
					symbol: "MYNFT",
					contractURI: "https://ipfs.io/ipfs/QmTKxwnqqxTxH4HE3UVM9yoJFZgbsZ8CuqqRFZCSWBF53m",
					isUserToken: true,
				},
			},
		})

		await result.tx.wait()

		await awaitForCollection(sdk, result.address)
	})
})
