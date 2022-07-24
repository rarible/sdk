import { Web3Ethereum } from "@rarible/web3-ethereum"
import { EthereumWallet } from "@rarible/sdk-wallet"
import { awaitAll, deployTestErc1155, deployTestErc20, deployTestErc721 } from "@rarible/ethereum-sdk-test-common"
import { toCollectionId, toItemId, toUnionAddress } from "@rarible/types"
import { Blockchain } from "@rarible/api-client"
import { createRaribleSdk } from "../../index"
import { retry } from "../../common/retry"
import { LogsLevel } from "../../domain"
import { awaitItem } from "../../common/test/await-item"
import { initProviders } from "./test/init-providers"
import { convertEthereumContractAddress } from "./common"
import { awaitOwnership } from "./test/await-ownership"

describe.skip("transfer", () => {
	const { web31, wallet1, wallet2 } = initProviders()
	const senderEthereum = new Web3Ethereum({ web3: web31 })
	const senderWallet = new EthereumWallet(senderEthereum)
	const sdk = createRaribleSdk(senderWallet, "development", { logs: LogsLevel.DISABLED })

	const it = awaitAll({
		testErc20: deployTestErc20(web31, "Test1", "TST1"),
		testErc721: deployTestErc721(web31, "Test2", "TST2"),
		testErc1155: deployTestErc1155(web31, "Test3"),
	})

	const erc721Address = convertEthereumContractAddress("0x96CE5b00c75e28d7b15F25eA392Cbb513ce1DE9E", Blockchain.ETHEREUM)

	test("transfer erc721", async () => {
		const senderRaw = wallet1.getAddressString()
		const receipentRaw = wallet2.getAddressString()
		const receipent = toUnionAddress(`ETHEREUM:${receipentRaw}`)

		const tokenId = "1"
		const itemId = toItemId(`ETHEREUM:${it.testErc721.options.address}:${tokenId}`)
		await it.testErc721.methods.mint(senderRaw, tokenId, "").send({
			from: senderRaw,
			gas: 500000,
		})

		await awaitItem(sdk, itemId)

		const transfer = await sdk.nft.transfer.prepare({ itemId })
		const tx = await transfer.submit({ to: receipent })

		await tx.wait()

		await retry(10, 1000, async () => {
			const balanceRecipient = await it.testErc721.methods.balanceOf(receipentRaw).call()
			expect(balanceRecipient).toBe("1")
		})
	})

	test("transfer erc721 with basic function", async () => {
		const receipentRaw = wallet2.getAddressString()
		const receipent = toUnionAddress(`ETHEREUM:${receipentRaw}`)

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

		await retry(10, 1000, async () => {
			return sdk.apis.ownership.getOwnershipById({
				ownershipId: `${mintResult.itemId}:${receipentRaw}`,
			})
		})
	})

	test("transfer erc1155", async () => {
		const senderRaw = wallet1.getAddressString()
		const receipentRaw = wallet2.getAddressString()
		const receipent = toUnionAddress(`ETHEREUM:${receipentRaw}`)

		const tokenId = "1"
		const itemId = toItemId(`ETHEREUM:${it.testErc1155.options.address}:${tokenId}`)
		await it.testErc1155.methods.mint(senderRaw, tokenId, 100, "123").send({
			from: senderRaw,
			gas: 200000,
		})

		await awaitItem(sdk, itemId)

		const transfer = await sdk.nft.transfer.prepare({ itemId })
		const tx = await transfer.submit({ to: receipent, amount: 10 })

		await tx.wait()

		await retry(10, 1000, async () => {
			const balanceRecipient = await it.testErc1155.methods.balanceOf(receipentRaw, tokenId).call()
			expect(balanceRecipient).toBe("10")
		})
	})

	test("transfer erc1155 with basic function", async () => {
		const receipentRaw = wallet2.getAddressString()
		const receipent = toUnionAddress(`ETHEREUM:${receipentRaw}`)

		const { itemId, transaction } = await sdk.nft.mint({
			collectionId: toCollectionId(erc721Address),
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

		await awaitOwnership(sdk, itemId, receipent)
	})

})
