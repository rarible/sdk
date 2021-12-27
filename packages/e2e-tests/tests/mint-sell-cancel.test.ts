import { Blockchain } from "@rarible/api-client"
import type { UnionAddress } from "@rarible/types"
import { toUnionAddress } from "@rarible/types"
import type { MintRequest } from "@rarible/sdk/build/types/nft/mint/mint-request.type"
import type { BlockchainWallet } from "@rarible/sdk-wallet"
import type { RequestCurrency } from "@rarible/sdk/src/common/domain"
import { sell } from "./common/atoms-tests/sell"
import { getEthereumWallet, getWalletAddress } from "./common/wallet"
import { createSdk } from "./common/create-sdk"
import { mint } from "./common/atoms-tests/mint"
import { getCollection } from "./common/helpers"
import { cancel } from "./common/atoms-tests/cancel"

const suites: {
	blockchain: Blockchain,
	wallet: BlockchainWallet,
	collectionId: string,
	mintRequest: (address: UnionAddress) => MintRequest,
	getCurrency: (wallet: BlockchainWallet) => Promise<RequestCurrency>
}[] = [
	{
		blockchain: Blockchain.ETHEREUM,
		wallet: getEthereumWallet(),
		collectionId: "ETHEREUM:0x22f8CE349A3338B15D7fEfc013FA7739F5ea2ff7",
		mintRequest: (walletAddress: UnionAddress): MintRequest => {
			return {
				uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
				creators: [{
					account: walletAddress,
					value: 10000,
				}],
				royalties: [],
				lazyMint: false,
				supply: 1,
			}
		},
		getCurrency: async (wallet: BlockchainWallet): Promise<RequestCurrency> => {
			if (wallet.blockchain === "ETHEREUM") {
				return {
					"@type": "ETH",
				}
			}
			throw new Error("Wrong blockchain")
		},
	},
	/*
	{
		blockchain: Blockchain.TEZOS,
		wallet: getTezosTestWallet(),
		collectionId: "TEZOS:KT1Ctz9vuC6uxsBPD4GbdbPaJvZogWhE9SLu",
		mintRequest: (walletAddress: UnionAddress): MintRequest => {
			return {
				uri: "ipfs://bafkreiaz7n5zj2qvtwmqnahz7rwt5h37ywqu7znruiyhwuav3rbbxzert4",
				creators: [{
					account: walletAddress,
					value: 10000,
				}],
				royalties: [],
				lazyMint: false,
				supply: 1,
			}
		},
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		getCurrency: async (wallet: BlockchainWallet): Promise<RequestCurrency> => {
			if (wallet.blockchain === "TEZOS") {
				return {
					"@type": "XTZ",
				}
			}
			throw new Error("Wrong blockchain")
		},
	},
   */
	/*{
		blockchain: Blockchain.FLOW,
		wallets: { seller: getFlowWallet(), buyer: getFlowWallet() },
		collectionId: "FLOW:A.ebf4ae01d1284af8.RaribleNFT",
		mintRequest: (walletAddress: UnionAddress) => {
			return {
				uri: "ipfs://ipfs/QmNe7Hd9xiqm1MXPtQQjVtksvWX6ieq9Wr6kgtqFo9D4CU",
				supply: 1,
				lazyMint: false,
			}
		},
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		getCurrency: async (wallet: BlockchainWallet): Promise<RequestCurrency> => {
			if (wallet.blockchain === "FLOW") {
				return {
					"@type": "FLOW_FT",
					contract: toContractAddress("FLOW:A.7e60df042a9c0868.FlowToken"),
				}
			}
			throw new Error("Wrong blockchain")
		},
	},*/
]

describe.each(suites)("$blockchain deploy-mint", (suite) => {
	const wallet = suite.wallet
	const sdk = createSdk(suite.blockchain, wallet)

	test("should mint, then sell, then cancel order", async () => {
		const sellerWalletAddress = toUnionAddress(await getWalletAddress(wallet))

		// Get collection
		const collection = await getCollection(sdk, suite.collectionId)

		// Mint token
		const { nft } = await mint(sdk, wallet, { collection }, suite.mintRequest(sellerWalletAddress))

		// Create sell order
		const sellAmount = 1
		const sellOrder = await sell(sdk, wallet, { itemId: nft.id }, {
			amount: sellAmount,
			price: "1",
			currency: await suite.getCurrency(wallet),
		})

		// Cancel order
		await cancel(sdk, wallet, { orderId: sellOrder.id })
	})
})
