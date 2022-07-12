import { toCollectionId, toUnionAddress } from "@rarible/types"
import { Blockchain } from "@rarible/api-client"
import { createRaribleSdk } from "../../index"
import { MintType } from "../../types/nft/mint/domain"
import { LogsLevel } from "../../domain"
import type { RaribleSdkEnvironment } from "../../config/domain"
import { awaitItemSupply } from "../ethereum/test/await-item-supply"
import { createTestWallet } from "./test/test-wallet"
import type { TezosMetadataResponse } from "./common"
import { getTestContract } from "./test/test-contracts"

describe.skip("mint test", () => {
	const env: RaribleSdkEnvironment = "testnet"
	const wallet = createTestWallet(
		"edskRqrEPcFetuV7xDMMFXHLMPbsTawXZjH9yrEz4RBqH1" +
    "D6H8CeZTTtjGA3ynjTqD8Sgmksi7p5g3u5KUEVqX2EWrRnq5Bymj",
		env
	)
	const sdk = createRaribleSdk(wallet, env, { logs: LogsLevel.DISABLED })

	const nftContract: string = getTestContract(env, "nftContract")
	const mtContract: string = getTestContract(env, "mtContract")

	test("mint NFT token test", async () => {
		const mintResponse = await sdk.nft.mint({
			collectionId: toCollectionId(nftContract),
		})

		const mintResult = await mintResponse.submit({
			uri: "ipfs://bafkreiaz7n5zj2qvtwmqnahz7rwt5h37ywqu7znruiyhwuav3rbbxzert4",
			supply: 1,
			lazyMint: false,
			royalties: [{
				account: toUnionAddress(`TEZOS:${await wallet.provider.address()}`),
				value: 1000,
			}],
			creators: [{
				account: toUnionAddress("TEZOS:tz1RLtXUYvgv7uTZGJ1ZtPQFg3PZkj4NUHrz"),
				value: 10000,
			}],
		})
		if (mintResult.type === MintType.ON_CHAIN) {
			await mintResult.transaction.wait()
		}
		await awaitItemSupply(sdk, mintResult.itemId, "1")
	}, 1500000)


	test("mint MT token test", async () => {
		const mintResponse = await sdk.nft.mint({
			collectionId: toCollectionId(mtContract),
		})
		const mintResult = await mintResponse.submit({
			uri: "ipfs://bafkreiczcdnvl3qr7fscbokjd5cakiuihhbb7q3zjpxpo5ij6ehazfjety",
			supply: 12,
			lazyMint: false,
			creators: [{
				account: toUnionAddress("TEZOS:tz1RLtXUYvgv7uTZGJ1ZtPQFg3PZkj4NUHrz"),
				value: 10000,
			}],
		})
		if (mintResult.type === MintType.ON_CHAIN) {
			await mintResult.transaction.wait()
		}
		await awaitItemSupply(sdk, mintResult.itemId, "12")

	}, 1500000)

	test("tezos preprocess metadata", () => {
		const response = sdk.nft.preprocessMeta({
			blockchain: Blockchain.TEZOS,
			name: "1",
			description: "2",
			image: {
				url: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG1",
				mimeType: "image/jpeg",
				fileName: "image",
			},
			animation: {
				url: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG2",
				mimeType: "image/mp4",
				fileName: "video",
			},
			external: "https://rarible.com",
			attributes: [{
				key: "eyes",
				value: "1",
			}],
		}) as TezosMetadataResponse

		expect(response.name).toBe("1")
		expect(response.description).toBe("2")
		expect(response.decimals).toBe(0)
		expect(response.artifactUri).toBe("ipfs://QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG2")
		expect(response.displayUri).toBe("ipfs://QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG1")
		expect(response.formats).toStrictEqual([
			{
				uri: "ipfs://QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG1",
				mimeType: "image/jpeg",
				fileName: "image",
			},
			{
				uri: "ipfs://QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG2",
				mimeType: "image/mp4",
				fileName: "video",
			},
		])
		expect(response.attributes[0].name).toBe("eyes")
		expect(response.attributes[0].value).toBe("1")
	})
})
