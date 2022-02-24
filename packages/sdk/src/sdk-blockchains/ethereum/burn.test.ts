import { Web3Ethereum } from "@rarible/web3-ethereum"
import { EthereumWallet } from "@rarible/sdk-wallet"
import { toAddress, toBigNumber, toUnionAddress } from "@rarible/types"
import { Blockchain } from "@rarible/api-client"
import { createRaribleSdk } from "../../index"
import { LogsLevel } from "../../domain"
import { initProviders } from "./test/init-providers"
import { awaitItem } from "./test/await-item"
import { awaitItemSupply } from "./test/await-item-supply"
import { convertEthereumContractAddress } from "./common"
import { awaitDeletedItem } from "./test/await-deleted-item"

describe("burn", () => {
	const { web31, wallet1 } = initProviders()
	const ethereum = new Web3Ethereum({ web3: web31 })
	const wallet = new EthereumWallet(ethereum, Blockchain.ETHEREUM)
	const sdk = createRaribleSdk(wallet, "e2e", { logs: LogsLevel.DISABLED })

	const contractErc721 = toAddress("0x87ECcc03BaBC550c919Ad61187Ab597E9E7f7C21")
	const contractErc1155 = toAddress("0x8812cFb55853da0968a02AaaEA84CD93EC4b42A1")
	const e2eErc721V3ContractAddress = toAddress("0x22f8CE349A3338B15D7fEfc013FA7739F5ea2ff7")
	const e2eErc1155V2ContractAddress = toAddress("0x268dF35c389Aa9e1ce0cd83CF8E5752b607dE90d")

	test("burn erc721", async () => {
		const senderRaw = wallet1.getAddressString()
		const sender = toUnionAddress(`ETHEREUM:${senderRaw}`)
		const collection = await sdk.apis.collection.getCollectionById({ collection: `ETHEREUM:${contractErc721}` })
		const mintAction = await sdk.nft.mint({ collection })
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

		await awaitItem(sdk, mintResult.itemId)

		const burn = await sdk.nft.burn({ itemId: mintResult.itemId })
		const tx = await burn.submit()

		if (tx) {
		  await tx.wait()
		}

		await awaitItemSupply(sdk, mintResult.itemId, toBigNumber("0"))
	})

	test("burn erc1155", async () => {
		const senderRaw = wallet1.getAddressString()
		const sender = toUnionAddress(`ETHEREUM:${senderRaw}`)

		const collection = await sdk.apis.collection.getCollectionById({
			collection: `ETHEREUM:${contractErc1155}`,
		})
		const mintAction = await sdk.nft.mint({ collection })
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

		await awaitItemSupply(sdk, mintResult.itemId, toBigNumber("10"))

		const burn = await sdk.nft.burn({
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
			collection: convertEthereumContractAddress(e2eErc721V3ContractAddress, Blockchain.ETHEREUM),
		})
		const mintAction = await sdk.nft.mint({ collection })
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

		const burn = await sdk.nft.burn({ itemId: mintResult.itemId })
		await burn.submit({
			creators: [{
				account: sender,
				value: 10000,
			}],
		})

		await awaitDeletedItem(sdk,  mintResult.itemId)
	})

	test.skip("burn erc1155 lazy item", async () => {
		const senderRaw = wallet1.getAddressString()
		const sender = toUnionAddress(`ETHEREUM:${senderRaw}`)

		const collection = await sdk.apis.collection.getCollectionById({
			collection: convertEthereumContractAddress(e2eErc1155V2ContractAddress, Blockchain.ETHEREUM),
		})
		const mintAction = await sdk.nft.mint({ collection })
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

		const burn = await sdk.nft.burn({
			itemId: mintResult.itemId,
		})
		await burn.submit({
			creators: [{
				account: sender,
				value: 10000,
			}],
		})

		await awaitDeletedItem(sdk,  mintResult.itemId)
	})
})
