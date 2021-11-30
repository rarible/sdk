import { Blockchain } from "@rarible/api-client"
import { toUnionAddress } from "@rarible/types"
import { createRaribleSdk } from "../../index"
import { awaitForCollection } from "./test/await-for-collection"
import { createTestWallet } from "./test/test-wallet"

describe("deploy tezos tests", () => {
	const wallet = createTestWallet(
		"edskRqrEPcFetuV7xDMMFXHLMPbsTawXZjH9yrEz4RBqH1" +
    "D6H8CeZTTtjGA3ynjTqD8Sgmksi7p5g3u5KUEVqX2EWrRnq5Bymj"
	)
	const sdk = createRaribleSdk(wallet, "dev")

	test.skip("deploy public nft", async () => {
		const owner = await wallet.provider.address()

		const result = await sdk.nft.deploy({
			blockchain: Blockchain.TEZOS,
			asset: {
				assetType: "NFT",
				arguments: {
					owner: toUnionAddress(`TEZOS:${owner}`),
					isPublicCollection: true,
				},
			},
		})

		await result.tx.wait()

		await awaitForCollection(sdk, result.address)
	})

	test.skip("deploy private nft", async () => {
		const owner = await wallet.provider.address()

		const result = await sdk.nft.deploy({
			blockchain: Blockchain.TEZOS,
			asset: {
				assetType: "NFT",
				arguments: {
					owner: toUnionAddress(`TEZOS:${owner}`),
					isPublicCollection: false,
				},
			},
		})

		await result.tx.wait()

		await awaitForCollection(sdk, result.address)
	})

	test.skip("deploy public mt", async () => {
		const owner = await wallet.provider.address()

		const result = await sdk.nft.deploy({
			blockchain: Blockchain.TEZOS,
			asset: {
				assetType: "MT",
				arguments: {
					owner: toUnionAddress(`TEZOS:${owner}`),
					isPublicCollection: true,
				},
			},
		})

		await result.tx.wait()

		await awaitForCollection(sdk, result.address)
	})

	test.skip("deploy private mt", async () => {
		const owner = await wallet.provider.address()

		const result = await sdk.nft.deploy({
			blockchain: Blockchain.TEZOS,
			asset: {
				assetType: "MT",
				arguments: {
					owner: toUnionAddress(`TEZOS:${owner}`),
					isPublicCollection: false,
				},
			},
		})

		await result.tx.wait()

		await awaitForCollection(sdk, result.address)
	})
})
