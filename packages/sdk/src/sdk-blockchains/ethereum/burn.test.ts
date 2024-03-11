import { Web3Ethereum } from "@rarible/web3-ethereum"
import { EthereumWallet } from "@rarible/sdk-wallet"
import { toBigNumber, toUnionAddress } from "@rarible/types"
import { Blockchain } from "@rarible/api-client"
import { LogsLevel } from "../../domain"
import { MintType } from "../../types/nft/mint/prepare"
import { awaitItem } from "../../common/test/await-item"
import { awaitItemSupply } from "../../common/test/await-item-supply"
// import { awaitDeletedItem } from "../../common/test/await-deleted-item"
import { createSdk } from "../../common/test/create-sdk"
import { awaitDeletedItem } from "../../common/test/await-deleted-item"
import { initProviders } from "./test/init-providers"
import { DEV_PK_1, DEV_PK_2 } from "./test/common"
import { EVMContractsTestSuite } from "./test/suite/contracts"

describe("burn", () => {
	const { web31, wallet1 } = initProviders({ pk1: DEV_PK_1, pk2: DEV_PK_2 })
	const ethereum = new Web3Ethereum({ web3: web31 })
	const wallet = new EthereumWallet(ethereum)
	const sdk = createSdk(wallet, "development", { logs: LogsLevel.DISABLED })

	const testSuite = new EVMContractsTestSuite(Blockchain.ETHEREUM, ethereum)
	const contractErc721 = testSuite.getContract("erc721_1").contractAddress
	const contractErc1155 = testSuite.getContract("erc1155_1").contractAddress

	test("burn erc721", async () => {
		const senderRaw = wallet1.getAddressString()
		const sender = toUnionAddress(`ETHEREUM:${senderRaw}`)
		const collection = await sdk.apis.collection.getCollectionById({
			collection: contractErc721,
		})
		const mintAction = await sdk.nft.mint.prepare({ collection })
		const mintResult  = await mintAction.submit({
			uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
			creators: [{
				account: sender,
				value: 10000,
			}],
			royalties: [],
			lazyMint: false,
			supply: 1,
		})
		if (mintResult.type === MintType.ON_CHAIN) {
			await mintResult.transaction.wait()
		}

		await awaitItem(sdk, mintResult.itemId)

		const burn = await sdk.nft.burn.prepare({ itemId: mintResult.itemId })
		const tx = await burn.submit()

		if (tx) {
		  await tx.wait()
		}

		await awaitDeletedItem(sdk, mintResult.itemId)
	})

	test("burn erc1155", async () => {
		const senderRaw = wallet1.getAddressString()
		const sender = toUnionAddress(`ETHEREUM:${senderRaw}`)

		const collection = await sdk.apis.collection.getCollectionById({
			collection: contractErc1155,
		})
		const mintAction = await sdk.nft.mint.prepare({ collection })
		const mintResult  = await mintAction.submit({
			uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
			creators: [{
				account: sender,
				value: 10000,
			}],
			royalties: [],
			lazyMint: false,
			supply: 10,
		})
		if (mintResult.type === MintType.ON_CHAIN) {
			await mintResult.transaction.wait()
		}

		await awaitItemSupply(sdk, mintResult.itemId, toBigNumber("10"))

		const burn = await sdk.nft.burn.prepare({
			itemId: mintResult.itemId,
		})
		const tx = await burn.submit({ amount: 5 })
		if (tx) {
			await tx.wait()
		}

		await awaitItemSupply(sdk, mintResult.itemId, toBigNumber("5"))
	})

	test.skip("burn erc-721 lazy item", async () => {
		const senderRaw = wallet1.getAddressString()
		const sender = toUnionAddress(`ETHEREUM:${senderRaw}`)

		const collection = await sdk.apis.collection.getCollectionById({
			collection: contractErc721,
		})
		const mintAction = await sdk.nft.mint.prepare({ collection })
		const mintResult  = await mintAction.submit({
			uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
			creators: [{
				account: sender,
				value: 10000,
			}],
			royalties: [],
			lazyMint: true,
			supply: 1,
		})

		await awaitItemSupply(sdk, mintResult.itemId, toBigNumber("1"))

		const burn = await sdk.nft.burn.prepare({ itemId: mintResult.itemId })
		await burn.submit({
			creators: [{
				account: sender,
				value: 10000,
			}],
		})

		// await awaitDeletedItem(sdk,  mintResult.itemId)
	})

	test.skip("burn erc1155 lazy item", async () => {
		const senderRaw = wallet1.getAddressString()
		const sender = toUnionAddress(`ETHEREUM:${senderRaw}`)

		const collection = await sdk.apis.collection.getCollectionById({
			collection: contractErc1155,
		})
		const mintAction = await sdk.nft.mint.prepare({ collection })
		const mintResult  = await mintAction.submit({
			uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
			creators: [{
				account: sender,
				value: 10000,
			}],
			royalties: [],
			lazyMint: true,
			supply: 10,
		})

		await awaitItemSupply(sdk, mintResult.itemId, toBigNumber("10"))

		const burn = await sdk.nft.burn.prepare({
			itemId: mintResult.itemId,
		})
		await burn.submit({
			creators: [{
				account: sender,
				value: 10000,
			}],
		})

		// await awaitDeletedItem(sdk,  mintResult.itemId)
	})

	test("burn erc1155 lazy item with basic function", async () => {
		const senderRaw = wallet1.getAddressString()
		const sender = toUnionAddress(`ETHEREUM:${senderRaw}`)

		const collection = await sdk.apis.collection.getCollectionById({
			collection: contractErc1155,
		})
		const mintResult = await sdk.nft.mint({
			collection,
			uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
			creators: [{
				account: sender,
				value: 10000,
			}],
			royalties: [],
			lazyMint: true,
			supply: 10,
		})

		await awaitItemSupply(sdk, mintResult.itemId, toBigNumber("10"))

		await sdk.nft.burn({
			itemId: mintResult.itemId,
			amount: 10,
		})
		// await awaitDeletedItem(sdk,  mintResult.itemId)
	})
})
