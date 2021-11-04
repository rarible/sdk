import { EthereumWallet } from "@rarible/sdk-wallet"
import { createE2eProvider } from "@rarible/ethereum-sdk-test-common"
import Web3 from "web3"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import { toAddress, toBigNumber, toUnionAddress } from "@rarible/types"
import { MintType } from "../../types/nft/mint/domain"
import { createRaribleSdk } from "../../index"

describe("mintAndSell", () => {
	const { provider, wallet } = createE2eProvider()
	const ethereum = new Web3Ethereum({ web3: new Web3(provider) })

	const ethereumWallet = new EthereumWallet(ethereum, toUnionAddress(`ETHEREUM:${wallet.getAddressString()}`))
	const sdk = createRaribleSdk(ethereumWallet, "e2e")

	const erc721Address = toAddress("0x22f8CE349A3338B15D7fEfc013FA7739F5ea2ff7")

	test("should mint and put on sale ERC721 token", async () => {
		const sender = await ethereum.getFrom()

		const collection = await sdk.apis.collection.getCollectionById({ collection: `ETHEREUM:${erc721Address}` })
		const action = await sdk.nft.mintAndSell({ collection })

		const result = await action.submit({
			uri: "uri",
			creators: [{ account: toUnionAddress(`ETHEREUM:${sender}`), value: toBigNumber("10000") }],
			royalties: [],
			lazyMint: false,
			supply: 1,
			price: "0.000000000000000001",
			currency: {
				"@type": "ETH",
			},
		})

		if (result.type === MintType.ON_CHAIN) {
			await result.transaction.wait()
		}

		const order = await sdk.apis.order.getOrderById({ id: result.orderId })
		expect(`${order.makeStock}`).toBe("1")
	})
})
