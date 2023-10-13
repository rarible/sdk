import { Blockchain } from "@rarible/api-client"
import type { UnionAddress } from "@rarible/types"
import { toBigNumber } from "@rarible/types"
import type { MintRequest } from "@rarible/sdk/build/types/nft/mint/mint-request.type"
import type { BlockchainWallet } from "@rarible/sdk-wallet"
import type { RequestCurrency } from "@rarible/sdk/src/common/domain"
import type { OrderRequest } from "@rarible/sdk/src/types/order/common"
import type { OrderUpdateRequest } from "@rarible/sdk/build/types/order/common"
import { retry } from "@rarible/sdk/build/common/retry"
import type { CreateCollectionRequestSimplified } from "@rarible/sdk/build/types/nft/deploy/simplified"
import {
	getEthereumWallet,
	getEthereumWalletBuyer,
	getWalletAddressFull,
} from "../../../common/wallet"
import { createSdk } from "../../../common/create-sdk"
import { mint } from "../../../common/atoms-tests/mint"
import { getCollection } from "../../../common/helpers"
import { bid } from "../../../common/atoms-tests/bid"
import { acceptBid } from "../../../common/atoms-tests/accept-bid"
import { getCurrency } from "../../../common/currency"
import { awaitForOwnershipValue } from "../../../common/api-helpers/ownership-helper"
import { bidUpdate } from "../../../common/atoms-tests/bid-update"
import { createCollection } from "../../../common/atoms-tests/create-collection"
import { getEndDateAfterMonthAsDate } from "../../../common/utils"

function suites(): {
	blockchain: Blockchain,
	description: string,
	wallets: { seller: BlockchainWallet, buyer: BlockchainWallet },
	deployRequest: CreateCollectionRequestSimplified,
	mintRequest: (creatorAddress: UnionAddress) => MintRequest,
	currency: string,
	bidRequest: (currency: RequestCurrency) => Promise<OrderRequest>,
	updateBidRequest: OrderUpdateRequest,
}[] {
	return [
		{
			blockchain: Blockchain.ETHEREUM,
			description: "ERC721 <=> ERC20",
			wallets: {
				seller: getEthereumWallet(),
				buyer: getEthereumWalletBuyer(),
			},
			deployRequest: {
				blockchain: Blockchain.ETHEREUM,
				type: "ERC721",
				name: "name",
				symbol: "RARI",
				baseURI: "https://ipfs.rarible.com",
				contractURI: "https://ipfs.rarible.com",
				isPublic: true,
			} as CreateCollectionRequestSimplified,
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
			currency: "ERC20",
			bidRequest: async (currency: RequestCurrency): Promise<OrderRequest> => {
				return {
					amount: 1,
					price: "10",
					currency: currency,
					expirationDate: getEndDateAfterMonthAsDate(),
				}
			},
			updateBidRequest: {
				price: "12",
			},
		},
		{
			blockchain: Blockchain.ETHEREUM,
			description: "ERC721_lazy <=> ERC20",
			wallets: {
				seller: getEthereumWallet(),
				buyer: getEthereumWalletBuyer(),
			},
			deployRequest: {
				blockchain: Blockchain.ETHEREUM,
				type: "ERC721",
				name: "name",
				symbol: "RARI",
				baseURI: "https://ipfs.rarible.com",
				contractURI: "https://ipfs.rarible.com",
				isPublic: true,
			} as CreateCollectionRequestSimplified,
			mintRequest: (creatorAddress: UnionAddress): MintRequest => {
				return {
					uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
					creators: [{
						account: creatorAddress,
						value: 10000,
					}],
					royalties: [],
					lazyMint: true,
					supply: 1,
				}
			},
			currency: "ERC20",
			bidRequest: async (currency: RequestCurrency): Promise<OrderRequest> => {
				return {
					amount: 1,
					price: "10",
					currency: currency,
					expirationDate: getEndDateAfterMonthAsDate(),
				}
			},
			updateBidRequest: {
				price: "12",
			},
		},
		{
			blockchain: Blockchain.ETHEREUM,
			description: "ERC1155 <=> ERC20",
			wallets: {
				seller: getEthereumWallet(),
				buyer: getEthereumWalletBuyer(),
			},
			deployRequest: {
				blockchain: Blockchain.ETHEREUM,
				type: "ERC1155",
				name: "name",
				symbol: "RARI",
				baseURI: "https://ipfs.rarible.com",
				contractURI: "https://ipfs.rarible.com",
				isPublic: true,
			} as CreateCollectionRequestSimplified,
			mintRequest: (creatorAddress: UnionAddress): MintRequest => {
				return {
					uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
					creators: [{
						account: creatorAddress,
						value: 10000,
					}],
					royalties: [],
					lazyMint: false,
					supply: 20,
				}
			},
			currency: "ERC20",
			bidRequest: async (currency: RequestCurrency): Promise<OrderRequest> => {
				return {
					amount: 5,
					price: "10",
					currency: currency,
					expirationDate: getEndDateAfterMonthAsDate(),
				}
			},
			updateBidRequest: {
				price: "12",
			},
		},
		{
			blockchain: Blockchain.ETHEREUM,
			description: "ERC1155_lazy <=> ERC20",
			wallets: {
				seller: getEthereumWallet(),
				buyer: getEthereumWalletBuyer(),
			},
			deployRequest: {
				blockchain: Blockchain.ETHEREUM,
				type: "ERC1155",
				name: "name",
				symbol: "RARI",
				baseURI: "https://ipfs.rarible.com",
				contractURI: "https://ipfs.rarible.com",
				isPublic: true,
			} as CreateCollectionRequestSimplified,
			mintRequest: (creatorAddress: UnionAddress): MintRequest => {
				return {
					uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
					creators: [{
						account: creatorAddress,
						value: 10000,
					}],
					royalties: [],
					lazyMint: true,
					supply: 20,
				}
			},
			currency: "ERC20",
			bidRequest: async (currency: RequestCurrency): Promise<OrderRequest> => {
				return {
					amount: 5,
					price: "10",
					currency: currency,
					expirationDate: getEndDateAfterMonthAsDate(),
				}
			},
			updateBidRequest: {
				price: "12",
			},
		},
	]
}

describe.each(suites())("$blockchain mint => floorBid => bidUpdate => acceptBid", (suite) => {
	const {
		seller: sellerWallet,
		buyer: buyerWallet,
	} = suite.wallets
	const sellerSdk = createSdk(suite.blockchain, sellerWallet)
	const buyerSdk = createSdk(suite.blockchain, buyerWallet)

	test(suite.description, async () => {
		const walletAddressSeller = await getWalletAddressFull(sellerWallet)
		const walletAddressBuyer = await getWalletAddressFull(buyerWallet)

		const { address } = await createCollection(sellerSdk, sellerWallet, suite.deployRequest)
		const collection = await getCollection(sellerSdk, address)

		const { nft } = await mint(sellerSdk, sellerWallet, { collection },
			suite.mintRequest(walletAddressSeller.unionAddress))

		const requestCurrency = await getCurrency(suite.wallets, suite.currency)
		const bidRequest = await suite.bidRequest(requestCurrency)

		const bidOrder = await bid(buyerSdk, buyerWallet, { collectionId: collection.id }, bidRequest)

		await retry(40, 3000, async () => {
			const collection1 = await getCollection(sellerSdk, address)
			expect(collection1.bestBidOrder?.takePrice).toBe(bidRequest.price)
		})

		await bidUpdate(buyerSdk, buyerWallet, { orderId: bidOrder.id }, suite.updateBidRequest)

		await retry(40, 3000, async () => {
			const collection2 = await getCollection(sellerSdk, address)
			expect(collection2.bestBidOrder?.takePrice).toBe(suite.updateBidRequest.price)
		})
		await retry(40, 3000, async () => {
			await acceptBid(sellerSdk, sellerWallet, { orderId: bidOrder.id },
				{
					amount: bidRequest.amount || 1,
					itemId: nft.id,
				})
		})

		await awaitForOwnershipValue(buyerSdk, nft.id, walletAddressBuyer.address, toBigNumber(String(bidRequest.amount)))

		await retry(40, 3000, async () => {
			const collection3 = await getCollection(sellerSdk, address)
			expect(collection3.bestBidOrder).toBe(undefined)
		})
	})
})
