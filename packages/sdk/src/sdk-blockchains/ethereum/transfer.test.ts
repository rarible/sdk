import { Web3Ethereum } from "@rarible/web3-ethereum"
import { EthereumWallet } from "@rarible/sdk-wallet"
import { awaitAll, deployTestErc1155, deployTestErc20, deployTestErc721 } from "@rarible/ethereum-sdk-test-common"
import { toItemId, toUnionAddress } from "@rarible/types"
import { createRaribleSdk } from "../../index"
import { retry } from "../../common/retry"
import { LogsLevel } from "../../domain"
import { initProviders } from "./test/init-providers"
import { awaitItem } from "./test/await-item"

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

		const transfer = await sdk.nft.transfer({ itemId })
		const tx = await transfer.submit({ to: receipent })

		await tx.wait()

		await retry(10, 1000, async () => {
			const balanceRecipient = await it.testErc721.methods.balanceOf(receipentRaw).call()
			expect(balanceRecipient).toBe("1")
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

		const transfer = await sdk.nft.transfer({ itemId })
		const tx = await transfer.submit({ to: receipent, amount: 10 })

		await tx.wait()

		await retry(10, 1000, async () => {
			const balanceRecipient = await it.testErc1155.methods.balanceOf(receipentRaw, tokenId).call()
			expect(balanceRecipient).toBe("10")
		})
	})

})
