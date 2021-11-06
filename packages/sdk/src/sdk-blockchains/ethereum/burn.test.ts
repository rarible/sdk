import { Web3Ethereum } from "@rarible/web3-ethereum"
import { EthereumWallet } from "@rarible/sdk-wallet"
import { toAddress, toBigNumber, toUnionAddress } from "@rarible/types"
import { createRaribleSdk } from "../../index"
import { initProviders } from "./test/init-providers"
import { awaitItem } from "./test/await-item"
import { awaitItemSupply } from "./test/await-item-supply"

describe("burn", () => {
	const { web31, wallet1 } = initProviders()
	const ethereum = new Web3Ethereum({ web3: web31 })
	const wallet = new EthereumWallet(ethereum)
	const sdk = createRaribleSdk(wallet, "e2e")

	const contractErc721 = toAddress("0x87ECcc03BaBC550c919Ad61187Ab597E9E7f7C21")
	const contractErc1155 = toAddress("0x8812cFb55853da0968a02AaaEA84CD93EC4b42A1")

	test("burn erc721", async () => {
		const senderRaw = wallet1.getAddressString()
		const sender = toUnionAddress(`ETHEREUM:${senderRaw}`)
		const collection = await sdk.apis.collection.getCollectionById({ collection: `ETHEREUM:${contractErc721}` })
		const mintAction = await sdk.nft.mint({ collection })
		const mintResult  = await mintAction.submit({
			uri: "uri",
			creators: [{
				account: sender,
				value: toBigNumber("10000"),
			}],
			royalties: [],
			lazyMint: false,
			supply: 1,
		})

		await awaitItem(sdk, mintResult.itemId)

		const burn = await sdk.nft.burn({ itemId: mintResult.itemId })
		const tx = await burn.submit()

		await tx.wait()

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
			uri: "uri",
			creators: [{
				account: sender,
				value: toBigNumber("10000"),
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
		await tx.wait()

		await awaitItemSupply(sdk, mintResult.itemId, toBigNumber("5"))
	})
})
