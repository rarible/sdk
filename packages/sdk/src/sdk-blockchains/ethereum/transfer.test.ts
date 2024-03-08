import { toCollectionId, toUnionAddress } from "@rarible/types"
import { Blockchain } from "@rarible/api-client"
import { getTestContract } from "@rarible/ethereum-sdk-test-common"
import { awaitItem } from "../../common/test/await-item"
import { createSdk } from "../../common/test/create-sdk"
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

	const erc721Address = convertEthereumContractAddress(
		getTestContract("dev-ethereum", "erc721V3"),
		Blockchain.ETHEREUM
	)

	const erc1155Address = convertEthereumContractAddress(
		getTestContract("dev-ethereum", "erc1155V2"),
		Blockchain.ETHEREUM
	)

	test("transfer erc721", async () => {
		const sdk = createSdk(eth1, "development")
		const receipent = toUnionAddress(`ETHEREUM:${receipentRaw}`)

		const mintResult = await sdk.nft.mint({
			uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
			collectionId: toCollectionId(erc721Address),
		})

		await awaitItem(sdk, mintResult.itemId)

		const transfer = await sdk.nft.transfer.prepare({ itemId: mintResult.itemId })
		const tx = await transfer.submit({ to: receipent })

		await tx.wait()

		await awaitOwnership(sdk, mintResult.itemId, receipent)
	})

	test("transfer erc721 with basic function", async () => {
		const sdk = createSdk(eth1, "development")

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

		await awaitOwnership(sdk, mintResult.itemId, receipent)
	})

	test("transfer erc1155", async () => {
		const sdk = createSdk(eth1, "development")

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
		const sdk = createSdk(eth1, "development")

		const mintResult = await sdk.nft.mint({
			collectionId: toCollectionId(erc1155Address),
			supply: 10,
			uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
		})

		await mintResult.transaction.wait()

		await awaitItem(sdk, mintResult.itemId)

		const tx = await sdk.nft.transfer({
			itemId: mintResult.itemId,
			to: receipent,
			amount: 10,
		})
		await tx.wait()

		await awaitOwnership(sdk, mintResult.itemId, receipent)
	})

})
