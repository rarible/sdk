import { EthereumWallet } from "@rarible/sdk-wallet"
import { createE2eProvider } from "@rarible/ethereum-sdk-test-common"
import Web3 from "web3"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import { toAddress } from "@rarible/types"
import { Blockchain } from "@rarible/api-client"
import { MintType } from "../../types/nft/mint/domain"
import { createRaribleSdk } from "../../index"
import type { CommonTokenMetadataResponse } from "../../types/nft/mint/preprocess-meta"
import { LogsLevel } from "../../domain"
import { convertEthereumContractAddress, convertEthereumToUnionAddress } from "./common"
import { awaitItem } from "./test/await-item"
import { providerDevelopmentSettings } from "./test/common"

describe.skip("mint", () => {
	const { provider, wallet } = createE2eProvider(undefined, providerDevelopmentSettings)
	const ethereum = new Web3Ethereum({ web3: new Web3(provider) })

	const ethereumWallet = new EthereumWallet(ethereum)
	const sdk = createRaribleSdk(ethereumWallet, "development", { logs: LogsLevel.DISABLED })

	const erc721Address = toAddress("0x96CE5b00c75e28d7b15F25eA392Cbb513ce1DE9E")
	const erc1155Address = toAddress("0xda75B20cCFf4F86d2E8Ef00Da61A166edb7a233a")

	test("should mint ERC721 token", async () => {
		const senderRaw = wallet.getAddressString()
		const sender = convertEthereumToUnionAddress(senderRaw, Blockchain.ETHEREUM)
		const contract = convertEthereumContractAddress(erc721Address, Blockchain.ETHEREUM)
		const collection = await sdk.apis.collection.getCollectionById({
			collection: contract,
		})
		const tokenId = await sdk.nft.generateTokenId({
			collection: contract,
			minter: sender,
		})
		const action = await sdk.nft.mint({
			collection,
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
			collection: convertEthereumContractAddress(erc1155Address, Blockchain.ETHEREUM),
		})
		const action = await sdk.nft.mint({ collection })

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
