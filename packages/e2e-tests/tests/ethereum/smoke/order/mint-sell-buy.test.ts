import { ActivityType, Blockchain } from "@rarible/api-client"
import type { UnionAddress } from "@rarible/types"
import { toBigNumber } from "@rarible/types"
import type { MintRequest } from "@rarible/sdk/build/types/nft/mint/mint-request.type"
import type { BlockchainWallet } from "@rarible/sdk-wallet"
import type { RequestCurrency } from "@rarible/sdk/src/common/domain"
import type { OrderRequest } from "@rarible/sdk/src/types/order/common"
import type { CreateCollectionRequestSimplified } from "@rarible/sdk/build/types/nft/deploy/simplified"
import { sell } from "../../../common/atoms-tests/sell"
import {
	getEthereumWallet,
	getEthereumWalletBuyer,
	getWalletAddressFull,
} from "../../../common/wallet"
import { createSdk } from "../../../common/create-sdk"
import { mint } from "../../../common/atoms-tests/mint"
import { awaitOrderStock, getCollection } from "../../../common/helpers"
import { buy } from "../../../common/atoms-tests/buy"
import { getCurrency } from "../../../common/currency"
import { awaitForOwnershipValue } from "../../../common/api-helpers/ownership-helper"
import { getActivitiesByItem } from "../../../common/api-helpers/activity-helper"
import { getEndDateAfterMonthAsDate } from "../../../common/utils"
import { createCollection } from "../../../common/atoms-tests/create-collection"

function suites(): {
	blockchain: Blockchain,
	description: string,
	wallets: { seller: BlockchainWallet, buyer: BlockchainWallet },
	deployRequest: CreateCollectionRequestSimplified,
	mintRequest: (address: UnionAddress) => MintRequest,
	currency: string,
	sellRequest: (currency: RequestCurrency) => Promise<OrderRequest>
}[] {
	return [
		{
			blockchain: Blockchain.ETHEREUM,
			description: "ERC721 <=> ETH",
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
			currency: "ETH",
			sellRequest: async (currency: RequestCurrency): Promise<OrderRequest> => {
				return {
					amount: 1,
					price: "0.0000000000000001",
					currency: currency,
					expirationDate: getEndDateAfterMonthAsDate(),
				}
			},
		},
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
			currency: "ERC20",
			sellRequest: async (currency: RequestCurrency): Promise<OrderRequest> => {
				return {
					amount: 1,
					price: "10",
					currency: currency,
					expirationDate: getEndDateAfterMonthAsDate(),
				}
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
			mintRequest: (walletAddress: UnionAddress): MintRequest => {
				return {
					uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
					creators: [{
						account: walletAddress,
						value: 10000,
					}],
					royalties: [],
					lazyMint: true,
					supply: 1,
				}
			},
			currency: "ERC20",
			sellRequest: async (currency: RequestCurrency): Promise<OrderRequest> => {
				return {
					amount: 1,
					price: "10",
					currency: currency,
					expirationDate: getEndDateAfterMonthAsDate(),
				}
			},
		},
		{
			blockchain: Blockchain.ETHEREUM,
			description: "ERC721_lazy <=> ETH",
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
			mintRequest: (walletAddress: UnionAddress): MintRequest => {
				return {
					uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
					creators: [{
						account: walletAddress,
						value: 10000,
					}],
					royalties: [],
					lazyMint: true,
					supply: 1,
				}
			},
			currency: "ETH",
			sellRequest: async (currency: RequestCurrency): Promise<OrderRequest> => {
				return {
					amount: 1,
					price: "0.0000000000000001",
					currency: currency,
					expirationDate: getEndDateAfterMonthAsDate(),
				}
			},
		},
		{
			blockchain: Blockchain.ETHEREUM,
			description: "ERC1155 <=> ETH",
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
			mintRequest: (walletAddress: UnionAddress): MintRequest => {
				return {
					uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
					creators: [{
						account: walletAddress,
						value: 10000,
					}],
					royalties: [],
					lazyMint: false,
					supply: 20,
				}
			},
			currency: "ETH",
			sellRequest: async (currency: RequestCurrency): Promise<OrderRequest> => {
				return {
					amount: 3,
					price: "0.0000000000000001",
					currency: currency,
					expirationDate: getEndDateAfterMonthAsDate(),
				}
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
			mintRequest: (walletAddress: UnionAddress): MintRequest => {
				return {
					uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
					creators: [{
						account: walletAddress,
						value: 10000,
					}],
					royalties: [],
					lazyMint: true,
					supply: 20,
				}
			},
			currency: "ERC20",
			sellRequest: async (currency: RequestCurrency): Promise<OrderRequest> => {
				return {
					amount: 3,
					price: "10",
					currency: currency,
					expirationDate: getEndDateAfterMonthAsDate(),
				}
			},
		},
		{
			blockchain: Blockchain.ETHEREUM,
			description: "ERC1155 <=> ETH",
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
			mintRequest: (walletAddress: UnionAddress): MintRequest => {
				return {
					uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
					creators: [{
						account: walletAddress,
						value: 10000,
					}],
					royalties: [],
					lazyMint: false,
					supply: 20,
				}
			},
			currency: "ETH",
			sellRequest: async (currency: RequestCurrency): Promise<OrderRequest> => {
				return {
					amount: 3,
					price: "0.0000000000000001",
					currency: currency,
					expirationDate: getEndDateAfterMonthAsDate(),
				}
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
			mintRequest: (walletAddress: UnionAddress): MintRequest => {
				return {
					uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
					creators: [{
						account: walletAddress,
						value: 10000,
					}],
					royalties: [],
					lazyMint: true,
					supply: 20,
				}
			},
			currency: "ERC20",
			sellRequest: async (currency: RequestCurrency): Promise<OrderRequest> => {
				return {
					amount: 3,
					price: "10",
					currency: currency,
					expirationDate: getEndDateAfterMonthAsDate(),
				}
			},
		},
	]
}

describe.each(suites())("$blockchain mint => sell => buy", (suite) => {
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

		const { nft } = await mint(
			sellerSdk,
			sellerWallet,
			{ collection },
			suite.mintRequest(walletAddressSeller.unionAddress)
		)

		const requestCurrency = await getCurrency(suite.wallets, suite.currency)
		const orderRequest = await suite.sellRequest(requestCurrency)

		const sellOrder = await sell(sellerSdk, sellerWallet, { itemId: nft.id }, orderRequest)

		await getActivitiesByItem(sellerSdk, nft.id,
			[ActivityType.LIST],
			[ActivityType.LIST])

		const buyAmount = orderRequest.amount
		await buy(buyerSdk, buyerWallet, nft.id, { orderId: sellOrder.id }, { amount: buyAmount || 1 })

		await awaitOrderStock(sellerSdk, sellOrder.id, toBigNumber("0"))
		await awaitForOwnershipValue(buyerSdk, nft.id, walletAddressBuyer.address, toBigNumber(String(buyAmount)))

		await getActivitiesByItem(sellerSdk, nft.id,
			[ActivityType.SELL, ActivityType.TRANSFER, ActivityType.MINT, ActivityType.LIST],
			[ActivityType.TRANSFER, ActivityType.SELL, ActivityType.LIST, ActivityType.MINT])
	})
})
