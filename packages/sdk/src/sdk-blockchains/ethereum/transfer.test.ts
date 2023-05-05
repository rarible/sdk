import { toCollectionId, toUnionAddress } from "@rarible/types"
import { Blockchain } from "@rarible/api-client"
import { createRaribleSdk } from "../../index"
import { LogsLevel } from "../../domain"
import { awaitItem } from "../../common/test/await-item"
import { initProvider } from "./test/init-providers"
import { convertEthereumContractAddress } from "./common"
import { awaitOwnership } from "./test/await-ownership"
import { createEthWallets } from "./test/common"
import { awaitErc721Balance } from "./test/await-erc-721-balance"
import { awaitErc1155Balance } from "./test/await-erc-1155-balance"

describe("transfer", () => {
	const [eth1] = createEthWallets(1)
	const { wallet } = initProvider()
	const receipentRaw = wallet.getAddressString()
	const receipent = toUnionAddress(`ETHEREUM:${receipentRaw}`)

	const erc1155Address = convertEthereumContractAddress("0x11F13106845CF424ff5FeE7bAdCbCe6aA0b855c1", Blockchain.ETHEREUM)

	test("transfer erc721", async () => {
		const erc721Address = convertEthereumContractAddress("0x96CE5b00c75e28d7b15F25eA392Cbb513ce1DE9E", Blockchain.ETHEREUM)
		const sdk = createRaribleSdk(eth1, "development", { logs: LogsLevel.DISABLED })
		const receipent = toUnionAddress(`ETHEREUM:${receipentRaw}`)

		const mintResult = await sdk.nft.mint({
			uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
			collectionId: toCollectionId(erc721Address),
		})

		await awaitItem(sdk, mintResult.itemId)

		const transfer = await sdk.nft.transfer.prepare({ itemId: mintResult.itemId })
		const tx = await transfer.submit({ to: receipent })

		await tx.wait()

		await awaitErc721Balance(eth1, mintResult.itemId, receipent)
	})

	test("transfer erc721 with basic function", async () => {
		const erc721Address = convertEthereumContractAddress("0x6972347e66A32F40ef3c012615C13cB88Bf681cc", Blockchain.ETHEREUM)
		const sdk = createRaribleSdk(eth1, "development", { logs: LogsLevel.DISABLED })

		const mintResult = await sdk.nft.mint({
			uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
			collectionId: toCollectionId(erc721Address),
		})
		await mintResult.transaction.wait()
		await awaitItem(sdk, mintResult.itemId)

		const transfer = await sdk.nft.transfer({
			itemId: mintResult.itemId,
			to: receipent,
		})

		await transfer.wait()

		await awaitErc721Balance(eth1, mintResult.itemId, receipent)
	})

	test("transfer erc1155", async () => {
		const sdk = createRaribleSdk(eth1, "development", { logs: LogsLevel.DISABLED })

		const mintResult = await sdk.nft.mint({
			uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
			supply: 10,
			collectionId: toCollectionId(erc1155Address),
		})
		await mintResult.transaction.wait()
		await awaitItem(sdk, mintResult.itemId)

		const transfer = await sdk.nft.transfer.prepare({ itemId: mintResult.itemId })
		const tx = await transfer.submit({ to: receipent, amount: 10 })

		await tx.wait()

		await awaitOwnership(sdk, mintResult.itemId, receipent)
	})

	test("transfer erc1155 with basic function", async () => {
		const sdk = createRaribleSdk(eth1, "development", { logs: LogsLevel.DISABLED })

		const { itemId, transaction } = await sdk.nft.mint({
			collectionId: toCollectionId(erc1155Address),
			supply: 10,
			uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
		})

		await transaction.wait()

		await awaitItem(sdk, itemId)

		const tx = await sdk.nft.transfer({
			itemId,
			to: receipent,
			amount: 10,
		})
		await tx.wait()

		await awaitErc1155Balance(eth1, itemId, receipent, 10)
	})

})
