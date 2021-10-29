import { Web3Ethereum } from "@rarible/web3-ethereum"
import { EthereumWallet } from "@rarible/sdk-wallet"
import { toAddress, toBigNumber, toUnionAddress } from "@rarible/types"
import { createRaribleSdk } from "../../index"
import { initProviders } from "./test/init-providers"
import { awaitItem } from "./test/await-item"
import { createTestErc1155, createTestErc721 } from "./test/create-contracts"

describe("burn", () => {

	const { web31, wallet1 } = initProviders({})

	const senderEthereum = new Web3Ethereum({ web3: web31 })
	const sdk = createRaribleSdk(new EthereumWallet(senderEthereum, toUnionAddress(`ETHEREUM:${wallet1.getAddressString()}`)), "e2e")

	const contractErc721 = toAddress("0x87ECcc03BaBC550c919Ad61187Ab597E9E7f7C21")
	const contractErc1155 = toAddress("0x8812cFb55853da0968a02AaaEA84CD93EC4b42A1")

	test("burn erc721", async () => {
		const contract = createTestErc721(web31, contractErc721)
		const sender = await senderEthereum.getFrom()

		const collection = await sdk.apis.collection.getCollectionById({ collection: `ETHEREUM:${contractErc721}` })
		const mintAction = await sdk.nft.mint({ collection })
		const mintResult  = await mintAction.submit({
			uri: "uri",
			creators: [{ account: toUnionAddress(sender), value: toBigNumber("10000") }],
			royalties: [],
			lazyMint: false,
			supply: 1,
		})

		await awaitItem(sdk, mintResult.itemId)

		const burn = await sdk.nft.burn({ itemId: mintResult.itemId })
		const tx = await burn.submit()

		await tx.wait()

		const balanceRecipient = await contract.methods.balanceOf(sender).call()
		expect(balanceRecipient).toBe("0")
	})

	test("transfer erc1155", async () => {
		const contract = createTestErc1155(web31, contractErc1155)
		const sender = await senderEthereum.getFrom()

		const collection = await sdk.apis.collection.getCollectionById({ collection: `ETHEREUM:${contractErc1155}` })
		const mintAction = await sdk.nft.mint({ collection })
		const mintResult  = await mintAction.submit({
			uri: "uri",
			creators: [{ account: toUnionAddress(sender), value: toBigNumber("10000") }],
			royalties: [],
			lazyMint: false,
			supply: 10,
		})

		await awaitItem(sdk, mintResult.itemId)

		const burn = await sdk.nft.burn({
			itemId: mintResult.itemId,
		})
		const tx = await burn.submit({ amount: 5 })

		await tx.wait()

		const tokenId = mintResult.itemId.split(":")[1]
		const balanceRecipient = await contract.methods.balanceOf(sender, tokenId).call()
		expect(balanceRecipient).toBe("5")
	})

})
