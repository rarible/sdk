import { Web3Ethereum } from "@rarible/web3-ethereum"
import { EthereumWallet } from "@rarible/sdk-wallet"
import { createRaribleSdk } from "@rarible/protocol-ethereum-sdk"
import { awaitAll } from "@rarible/ethereum-sdk-test-common"
import { deployTestErc20 } from "@rarible/protocol-ethereum-sdk/build/order/contracts/test/test-erc20"
import { deployTestErc721 } from "@rarible/protocol-ethereum-sdk/build/order/contracts/test/test-erc721"
import { deployTestErc1155 } from "@rarible/protocol-ethereum-sdk/build/order/contracts/test/test-erc1155"
import { toItemId, toUnionAddress } from "@rarible/types"
import { initProviders } from "./test/init-providers"
import { awaitItem } from "./test/await-item"
import { createEthereumSdk } from "./index"

describe("transfer", () => {

	const {
		web31,
		web32,
	} = initProviders({})

	const senderEthereum = new Web3Ethereum({ web3: web31 })
	const receipentEthereum = new Web3Ethereum({ web3: web32 })
	const senderSdk = createEthereumSdk(new EthereumWallet(senderEthereum, "e2e"))

	const raribleSdk = createRaribleSdk(senderEthereum, "e2e")

	const it = awaitAll({
		testErc20: deployTestErc20(web31, "Test1", "TST1"),
		testErc721: deployTestErc721(web31, "Test2", "TST2"),
		testErc1155: deployTestErc1155(web31, "Test3"),
	})

	test("transfer erc721", async () => {
		const sender = await senderEthereum.getFrom()
		const receipent = await receipentEthereum.getFrom()

		const tokenId = "1"
		const itemId = toItemId(`${it.testErc721.options.address}:${tokenId}`)
		await it.testErc721.methods.mint(sender, tokenId, "").send({ from: sender, gas: 500000 })

		await awaitItem(raribleSdk, itemId)

		const transfer = await senderSdk.nft.transfer({ itemId })
		const tx = await transfer.submit.start({
			to: toUnionAddress(receipent),
		}).runAll()

		await tx.wait()

		const balanceRecipient = await it.testErc721.methods.balanceOf(receipent).call()
		expect(balanceRecipient).toBe("1")
	})

	test("transfer erc1155", async () => {
		const sender = await senderEthereum.getFrom()
		const receipent = await receipentEthereum.getFrom()

		const tokenId = "1"
		const itemId = toItemId(`${it.testErc1155.options.address}:${tokenId}`)
		await it.testErc1155.methods.mint(sender, tokenId, 100, "123").send({ from: sender, gas: 200000 })

		await awaitItem(raribleSdk, itemId)

		const transfer = await senderSdk.nft.transfer({ itemId })
		const tx = await transfer.submit.start({
			to: toUnionAddress(receipent),
			amount: 10,
		}).runAll()

		await tx.wait()

		const balanceRecipient = await it.testErc1155.methods.balanceOf(receipent, tokenId).call()
		expect(balanceRecipient).toBe("10")
	})

})
