import { Blockchain } from "@rarible/api-client"
import { createRaribleSdk } from "../../index"
import { LogsLevel } from "../../domain"
import type { RaribleSdkEnvironment } from "../../config/domain"
import { awaitForCollection } from "./test/await-for-collection"
import { createTestWallet } from "./test/test-wallet"

describe.skip("deploy tezos tests", () => {
	const env: RaribleSdkEnvironment = "development"
	const wallet = createTestWallet(
		"edskRqrEPcFetuV7xDMMFXHLMPbsTawXZjH9yrEz4RBqH1" +
    "D6H8CeZTTtjGA3ynjTqD8Sgmksi7p5g3u5KUEVqX2EWrRnq5Bymj",
		env
	)
	const sdk = createRaribleSdk(wallet, env, { logs: LogsLevel.DISABLED })

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
		console.log("result", result)
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
