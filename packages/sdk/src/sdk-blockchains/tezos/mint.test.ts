import { toContractAddress, toUnionAddress } from "@rarible/types"
import { MetaContentRepresentation } from "@rarible/api-client/build/models/MetaContent"
import { Blockchain } from "@rarible/api-client"
import { createRaribleSdk } from "../../index"
import { MintType } from "../../types/nft/mint/domain"
import { awaitForItemSupply } from "./test/await-for-item-supply"
import { createTestWallet } from "./test/test-wallet"

describe("mint test", () => {
	const wallet = createTestWallet(
		"edskRqrEPcFetuV7xDMMFXHLMPbsTawXZjH9yrEz4RBqH1" +
    "D6H8CeZTTtjGA3ynjTqD8Sgmksi7p5g3u5KUEVqX2EWrRnq5Bymj"
	)
	const sdk = createRaribleSdk(wallet, "dev")

	let nftContract: string = "KT1DK9ArYc2QVgqr4jz46WnWt5g9zsE3Cifb"
	let mtContract: string = "KT18vSGouhJcJZDDgrbBKkdCBjSXJWSbui3i"

	test.skip("mint NFT token test", async () => {
		const mintResponse = await sdk.nft.mint({
			collectionId: toContractAddress(`TEZOS:${nftContract}`),
		})

		const mintResult = await mintResponse.submit({
			uri: "ipfs://bafkreiaz7n5zj2qvtwmqnahz7rwt5h37ywqu7znruiyhwuav3rbbxzert4",
			supply: 1,
			lazyMint: false,
			royalties: [{
				account: toUnionAddress(`TEZOS:${await wallet.provider.address()}`),
				value: 10000,
			}],
			creators: [{
				account: toUnionAddress("TEZOS:tz1RLtXUYvgv7uTZGJ1ZtPQFg3PZkj4NUHrz"),
				value: 10000,
			}],
		})
		if (mintResult.type === MintType.ON_CHAIN) {
			await mintResult.transaction.wait()
		}
		console.log(mintResult)
		await awaitForItemSupply(sdk, mintResult.itemId, "1")
	}, 1500000)


	test.skip("mint MT token test", async () => {
		const mintResponse = await sdk.nft.mint({
			collectionId: toContractAddress(`TEZOS:${mtContract}`),
		})
		const mintResult = await mintResponse.submit({
			uri: "ipfs://bafkreiaz7n5zj2qvtwmqnahz7rwt5h37ywqu7znruiyhwuav3rbbxzert4",
			supply: 12,
			lazyMint: false,
			royalties: [{
				account: toUnionAddress(`TEZOS:${await wallet.provider.address()}`),
				value: 10000,
			}],
			creators: [{
				account: toUnionAddress("TEZOS:tz1RLtXUYvgv7uTZGJ1ZtPQFg3PZkj4NUHrz"),
				value: 10000,
			}],
		})
		if (mintResult.type === MintType.ON_CHAIN) {
			await mintResult.transaction.wait()
		}
		await awaitForItemSupply(sdk, mintResult.itemId, "10")

	}, 1500000)

	test("prepare mint", () => {
		sdk.nft.preprocessMeta({
			blockchain: Blockchain.TEZOS,
			name: "MultiFaucet Test NFT",
			description: "A test NFT dispensed from faucet.paradigm.xyz.",
			attributes: [{
				key: "attr1",
				value: "1",
			}],
			content: [
				{
					"@type": "IMAGE",
					url: "ipfs://ipfs/bafybeifvwitulq6elvka2hoqhwixfhgb42l4aiukmtrw335osetikviuuu",
					representation: MetaContentRepresentation.ORIGINAL,
					mimeType: "image/png",
					width: 1007,
					height: 1007,
				},
			],
		})
	})
})
