import { EthereumWallet } from "@rarible/sdk-wallet"
import { createE2eProvider } from "@rarible/ethereum-sdk-test-common"
import Web3 from "web3"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import { toBigNumber, toUnionAddress } from "@rarible/types"
import { MintType } from "../../nft/mint/domain"
import { createEthereumSdk } from "./index"

describe("mint", () => {
	const { provider, wallet } = createE2eProvider()
	const ethereum = new Web3Ethereum({ web3: new Web3(provider) })

	const ethereumWallet = new EthereumWallet(ethereum, toUnionAddress(wallet.getAddressString()))
	const sdk = createEthereumSdk(ethereumWallet, "e2e")

	const erc721Address = toUnionAddress("0x22f8CE349A3338B15D7fEfc013FA7739F5ea2ff7")
	const erc1155Address = toUnionAddress("0x268dF35c389Aa9e1ce0cd83CF8E5752b607dE90d")

	test("should mint ERC721 token", async () => {
		const sender = await ethereum.getFrom()

		const action = await sdk.nft.mint({
			collection: {
				name: "Test-collection",
				id: erc721Address,
				features: ["SECONDARY_SALE_FEES", "MINT_AND_TRANSFER"],
				type: "ERC721",
			},
		})

		const result = await action.submit.start({
			uri: "uri",
			creators: [{ account: toUnionAddress(sender), value: toBigNumber("10000") }],
			royalties: [],
			lazyMint: false,
			supply: 1,
		}).runAll()

		if (result.type === MintType.ON_CHAIN) {
			await result.transaction.wait()
		}
	})

	test("should mint ERC1155 token", async () => {
		const sender = await ethereum.getFrom()

		const action = await sdk.nft.mint({
			collection: {
				features: ["MINT_AND_TRANSFER"],
				id: erc1155Address,
				name: "Test-collection",
				type: "ERC1155",
			},
		})

		const result = await action.submit.start({
			uri: "uri",
			creators: [{ account: toUnionAddress(sender), value: toBigNumber("10000") }],
			royalties: [],
			lazyMint: false,
			supply: 1,
		}).runAll()


		if (result.type === MintType.ON_CHAIN) {
			await result.transaction.wait()
		}
	})

})
