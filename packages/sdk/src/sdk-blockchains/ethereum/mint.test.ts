import { EthereumWallet } from "@rarible/sdk-wallet"
import { createE2eProvider } from "@rarible/ethereum-sdk-test-common"
import Web3 from "web3"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import { toCollectionId } from "@rarible/types"
import { Blockchain } from "@rarible/api-client"
import { MintType } from "../../types/nft/mint/prepare"
import { createRaribleSdk } from "../../index"
import type { CommonTokenMetadataResponse } from "../../types/nft/mint/preprocess-meta"
import { LogsLevel } from "../../domain"
import { awaitItem } from "../../common/test/await-item"
import { convertEthereumContractAddress, convertEthereumToUnionAddress } from "./common"
import { DEV_PK_1, ETH_DEV_SETTINGS } from "./test/common"

describe("mint", () => {
	const { provider, wallet } = createE2eProvider(DEV_PK_1, ETH_DEV_SETTINGS)
	const ethereum = new Web3Ethereum({ web3: new Web3(provider) })

	const ethereumWallet = new EthereumWallet(ethereum)
	const sdk = createRaribleSdk(ethereumWallet, "development", { logs: LogsLevel.DISABLED })

	const erc1155Address = convertEthereumContractAddress("0xda75B20cCFf4F86d2E8Ef00Da61A166edb7a233a", Blockchain.ETHEREUM)
	const erc721Address = convertEthereumContractAddress("0x64F088254d7EDE5dd6208639aaBf3614C80D396d", Blockchain.ETHEREUM)

	test("should mint ERC721 token with simplified function", async () => {

		const result = await sdk.nft.mint({
			uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
			collectionId: toCollectionId(erc721Address),
		})

		expect(result.type).toBe(MintType.ON_CHAIN)
		const transaction = await result.transaction.wait()
		expect(transaction.blockchain).toEqual("ETHEREUM")
		expect(transaction.hash).toBeTruthy()

		await awaitItem(sdk, result.itemId)
	})

	test("should lazy mint ERC721 token with simplified function", async () => {
		const result = await sdk.nft.mint({
			uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
			collectionId: toCollectionId(erc721Address),
			lazyMint: true,
		})

		expect(result.type).toBe(MintType.OFF_CHAIN)
		expect(result.itemId).toBeTruthy()

		await awaitItem(sdk, result.itemId)
	})

	test("should mint ERC721 token", async () => {
		const senderRaw = wallet.getAddressString()
		const sender = convertEthereumToUnionAddress(senderRaw, Blockchain.ETHEREUM)
		const tokenId = await sdk.nft.generateTokenId({
			collection: erc721Address,
			minter: sender,
		})
		const action = await sdk.nft.mint.prepare({
			collectionId: toCollectionId(erc721Address),
			tokenId: tokenId,
		})

		const result = await action.submit({
			uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
			creators: [{
				account: sender,
				value: 10000,
			}],
			royalties: [],
			lazyMint: false,
			supply: 1,
		})

		if (result.type === MintType.ON_CHAIN) {
			const transaction = await result.transaction.wait()
			expect(transaction.blockchain).toEqual("ETHEREUM")
			expect(transaction.hash).toBeTruthy()

			const item = await awaitItem(sdk, result.itemId)
			expect(item.tokenId).toEqual(tokenId?.tokenId)
		} else {
			throw new Error("Must be on chain")
		}
	})

	test("should mint ERC1155 token", async () => {
		const senderRaw = wallet.getAddressString()
		const sender = convertEthereumToUnionAddress(senderRaw, Blockchain.ETHEREUM)
		const collection = await sdk.apis.collection.getCollectionById({
			collection: erc1155Address,
		})
		const action = await sdk.nft.mint.prepare({ collection })

		const result = await action.submit({
			uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
			creators: [{
				account: sender,
				value: 10000,
			}],
			royalties: [],
			lazyMint: false,
			supply: 1,
		})

		if (result.type === MintType.ON_CHAIN) {
			const transaction = await result.transaction.wait()
			expect(transaction.blockchain).toEqual("ETHEREUM")
			expect(transaction.hash).toBeTruthy()
		} else {
			throw new Error("Must be on chain")
		}
	})

	test("test preprocess metadata", () => {
		const response = sdk.nft.preprocessMeta({
			blockchain: Blockchain.ETHEREUM,
			name: "1",
			description: "2",
			image: {
				url: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
				mimeType: "image/jpeg",
			},
			animation: {
				url: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG6",
				mimeType: "image/gif",
			},
			external: "https://rarible.com",
			attributes: [{
				key: "eyes",
				value: "1",
			}],
		}) as CommonTokenMetadataResponse

		expect(response.name).toBe("1")
		expect(response.description).toBe("2")
		expect(response.image).toBe("ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5")
		expect(response.animation_url).toBe("ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG6")
		expect(response.external_url).toBe("https://rarible.com")
		expect(response.attributes[0].key).toBe("eyes")
		expect(response.attributes[0].value).toBe("1")
	})
})
