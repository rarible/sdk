import { Blockchain } from "@rarible/api-client"
import type { UnionAddress } from "@rarible/types"
import { toBigNumber, toContractAddress, toUnionAddress } from "@rarible/types"
import type { MintRequest } from "@rarible/sdk/build/types/nft/mint/mint-request.type"
import { deployTestErc20 } from "@rarible/protocol-ethereum-sdk/build/order/contracts/test/test-erc20"
import type { BlockchainWallet } from "@rarible/sdk-wallet"
import type { RequestCurrency } from "@rarible/sdk/src/common/domain"
import type { OrderRequest } from "@rarible/sdk/src/types/order/common"
import { sell } from "./common/atoms-tests/sell"
import { getEthereumWallet, getTezosTestWallet, getWalletAddress } from "./common/wallet"
import { createSdk } from "./common/create-sdk"
import { mint } from "./common/atoms-tests/mint"
import { awaitOrderStock, getCollection } from "./common/helpers"
import { buy } from "./common/atoms-tests/buy"

const suites: {
	blockchain: Blockchain,
	wallets: { seller: BlockchainWallet, buyer: BlockchainWallet },
	collectionId: string,
	mintRequest: (address: UnionAddress) => MintRequest,
	sellRequest: (amount: number, currency: RequestCurrency) => Promise<OrderRequest>,
	getCurrency: (wallet: { seller: BlockchainWallet, buyer: BlockchainWallet }) => Promise<RequestCurrency>
}[] = [
	{
		blockchain: Blockchain.ETHEREUM,
		wallets: { seller: getEthereumWallet(), buyer: getEthereumWallet() },
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
		sellRequest: async (amount: number, currency: RequestCurrency): Promise<OrderRequest> => {
			return {
				amount: amount,
				price: "0.0000000000000001",
				currency: currency,
			}
		},
		getCurrency: async (wallets: { seller: BlockchainWallet, buyer: BlockchainWallet }): Promise<RequestCurrency> => {
			if (wallets.seller.blockchain === "ETHEREUM" && wallets.buyer.blockchain === "ETHEREUM") {
				const testErc20 = await deployTestErc20((wallets.seller.ethereum as any).config.web3, "test erc20", "TST20")
				await testErc20.methods.mint(await getWalletAddress(wallets.buyer, false), 1000).send({
					from: await getWalletAddress(wallets.seller, false),
					gas: 200000,
				})

				return {
					"@type": "ERC20",
					contract: toContractAddress(`ETHEREUM:${testErc20.options.address}`),
				}
			}
			throw new Error("Wrong blockchain")
		},
	},
	{
		blockchain: Blockchain.TEZOS,
		wallets: { seller: getTezosTestWallet(0), buyer: getTezosTestWallet(1) },
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
		sellRequest: async (amount: number, currency: RequestCurrency): Promise<OrderRequest> => {
			return {
				amount: amount,
				price: "0.02",
				currency: currency,
			}
		},
		getCurrency: async (wallets: { seller: BlockchainWallet, buyer: BlockchainWallet }): Promise<RequestCurrency> => {
			if (wallets.seller.blockchain === "TEZOS" && wallets.buyer.blockchain === "TEZOS") {
				return {
					"@type": "XTZ",
				}
			}
			throw new Error("Wrong blockchain")
		},
	},
	/*{
		blockchain: Blockchain.FLOW,
		wallets: { seller: getFlowWallet(), buyer: getFlowWallet() },
		collectionId: "FLOW:A.ebf4ae01d1284af8.RaribleNFT",
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		mintRequest: (walletAddress: UnionAddress) => {
			return {
				uri: "ipfs://ipfs/QmNe7Hd9xiqm1MXPtQQjVtksvWX6ieq9Wr6kgtqFo9D4CU",
				supply: 1,
				lazyMint: false,
			}
		},
		sellRequest: async (amount: number, currency: RequestCurrency): Promise<OrderRequest> => {
			return {
				amount: amount,
				price: "0.2",
				currency: currency,
			}
		},
		getCurrency: async (wallets: { seller: BlockchainWallet, buyer: BlockchainWallet }): Promise<RequestCurrency> => {
			if (wallets.seller.blockchain === "FLOW" && wallets.buyer.blockchain === "FLOW") {
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
	const { seller: sellerWallet, buyer: buyerWallet } = suite.wallets
	const sellerSdk = createSdk(suite.blockchain, sellerWallet)
	const buyerSdk = createSdk(suite.blockchain, buyerWallet)

	test("should mint, then sell, then buy", async () => {
		const sellerWalletAddress = toUnionAddress(await getWalletAddress(sellerWallet))

		// Get collection
		const collection = await getCollection(sellerSdk, suite.collectionId)

		// Mint token
		const { nft } = await mint(sellerSdk, sellerWallet, { collection }, suite.mintRequest(sellerWalletAddress))

		// Create sell order
		const sellAmount = 1
		const sellOrder = await sell(
			sellerSdk,
			sellerWallet,
			{ itemId: nft.id },
			await suite.sellRequest(sellAmount, await suite.getCurrency(suite.wallets))
		)

		// Fill sell order
		const buyAmount = sellAmount
		await buy(buyerSdk, buyerWallet, nft.id, { orderId: sellOrder.id }, { amount: buyAmount })

		const nextStock = toBigNumber("0")
		await awaitOrderStock(sellerSdk, sellOrder.id, nextStock)
	})
})
