import { Blockchain } from "@rarible/api-client"
import type { UnionAddress } from "@rarible/types"
import { toContractAddress, toUnionAddress } from "@rarible/types"
import type { MintRequest } from "@rarible/sdk/build/types/nft/mint/mint-request.type"
import { deployTestErc20 } from "@rarible/protocol-ethereum-sdk/build/order/contracts/test/test-erc20"
import type { BlockchainWallet } from "@rarible/sdk-wallet"
import type { RequestCurrency } from "@rarible/sdk/src/common/domain"
import type { OrderRequest } from "@rarible/sdk/src/types/order/common"
import { getEthereumWallet, getWalletAddress } from "./common/wallet"
import { createSdk } from "./common/create-sdk"
import { mint } from "./common/atoms-tests/mint"
import { awaitForOwnership, getCollection } from "./common/helpers"
import { bid } from "./common/atoms-tests/bid"
import { acceptBid } from "./common/atoms-tests/accept-bid"

const suites: {
	blockchain: Blockchain,
	wallets: { seller: BlockchainWallet, buyer: BlockchainWallet },
	collectionId: string,
	mintRequest: (creatorAddress: UnionAddress) => MintRequest,
	bidRequest: (currency: RequestCurrency, payoutAddress: UnionAddress) => Promise<OrderRequest>,
	getCurrency: (wallet: { seller: BlockchainWallet, buyer: BlockchainWallet }) => Promise<RequestCurrency>
}[] = [
	{
		blockchain: Blockchain.ETHEREUM,
		wallets: { seller: getEthereumWallet(), buyer: getEthereumWallet() },
		collectionId: "ETHEREUM:0x22f8CE349A3338B15D7fEfc013FA7739F5ea2ff7",
		mintRequest: (creatorAddress: UnionAddress): MintRequest => {
			return {
				uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
				creators: [{
					account: creatorAddress,
					value: 10000,
				}],
				royalties: [],
				lazyMint: false,
				supply: 1,
			}
		},
		bidRequest: async (currency: RequestCurrency): Promise<OrderRequest> => {
			return {
				amount: 1,
				price: "0.1",
				currency: currency,
			}
		},
		getCurrency: async (wallets: { seller: BlockchainWallet, buyer: BlockchainWallet }): Promise<RequestCurrency> => {
			if (wallets.seller.blockchain === "ETHEREUM" && wallets.buyer.blockchain === "ETHEREUM") {
				const testErc20 = await deployTestErc20((wallets.seller.ethereum as any).config.web3, "test erc20", "TST20")
				await testErc20.methods.mint(await getWalletAddress(wallets.buyer, false), "1000000000000000000000000").send({
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
	/*{
		blockchain: Blockchain.TEZOS,
		wallets: { seller: getTezosWallet(2), buyer: getTezosWallet(1) },
		collectionId: "TEZOS:KT1DK9ArYc2QVgqr4jz46WnWt5g9zsE3Cifb",
		mintRequest: (creatorAddress: UnionAddress): MintRequest => {
			return {
				uri: "ipfs://bafkreiaz7n5zj2qvtwmqnahz7rwt5h37ywqu7znruiyhwuav3rbbxzert4",
				creators: [{
					account: creatorAddress,
					value: 10000,
				}],
				royalties: [],
				lazyMint: false,
				supply: 1,
			}
		},
		bidRequest: async (currency: RequestCurrency, payoutAddress: UnionAddress): Promise<OrderRequest> => {
			return {
				amount: 1,
				price: "0.000001",
				currency: currency,
				payouts: [{
					account: payoutAddress,
					value: 10000,
				}],
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
	},*/
]

describe.each(suites)("$blockchain deploy-mint", (suite) => {
	const { seller: sellerWallet, buyer: buyerWallet } = suite.wallets
	const sellerSdk = createSdk(suite.blockchain, sellerWallet)
	const buyerSdk = createSdk(suite.blockchain, buyerWallet)

	test("should mint, then make bid, then acceptBid", async () => {
		const sellerWalletAddress = toUnionAddress(await getWalletAddress(sellerWallet))

		// Get collection
		const collection = await getCollection(sellerSdk, suite.collectionId)

		// Mint token
		const { nft } = await mint(sellerSdk, sellerWallet, { collection }, suite.mintRequest(sellerWalletAddress))

		// Create bid order
		const bidRequest = await suite.bidRequest(await suite.getCurrency(suite.wallets), sellerWalletAddress)
		const bidOrder = await bid(
			buyerSdk,
			buyerWallet,
			{ itemId: nft.id },
			bidRequest
		)

		// Fill bid order
		await acceptBid(sellerSdk, sellerWallet, { orderId: bidOrder.id }, { amount: bidRequest.amount })

		// Check token transfer
		await awaitForOwnership(buyerSdk, nft.id, await getWalletAddress(buyerWallet, false))
	})
})
