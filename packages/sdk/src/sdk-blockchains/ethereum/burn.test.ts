import { Web3Ethereum } from "@rarible/web3-ethereum"
import { EthereumWallet } from "@rarible/sdk-wallet"
import { toAddress, toBigNumber, toUnionAddress } from "@rarible/types"
import { Blockchain } from "@rarible/api-client"
import { createRaribleSdk } from "../../index"
import { LogsLevel } from "../../domain"
import { MintType } from "../../types/nft/mint/domain"
import { initProviders } from "./test/init-providers"
import { awaitItem } from "./test/await-item"
import { awaitItemSupply } from "./test/await-item-supply"
import { convertEthereumContractAddress } from "./common"
import { awaitDeletedItem } from "./test/await-deleted-item"

describe.skip("burn", () => {
	const { web31, wallet1 } = initProviders()
	const ethereum = new Web3Ethereum({ web3: web31 })
	const wallet = new EthereumWallet(ethereum)
	const sdk = createRaribleSdk(wallet, "development", { logs: LogsLevel.DISABLED })

	const contractErc721 = toAddress("0x4Ab7B255Df8B212678582F7271BE99f3dECe1eAE")
	const contractErc1155 = toAddress("0xFe3d1f0003B17eA0C8D29164F0511508f1425b3a")
	const e2eErc721V3ContractAddress = toAddress("0x4Ab7B255Df8B212678582F7271BE99f3dECe1eAE")
	const e2eErc1155V2ContractAddress = toAddress("0xFe3d1f0003B17eA0C8D29164F0511508f1425b3a")

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
		if (mintResult.type === MintType.ON_CHAIN) {
			await mintResult.transaction.wait()
		}

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
		if (mintResult.type === MintType.ON_CHAIN) {
			await mintResult.transaction.wait()
		}

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
