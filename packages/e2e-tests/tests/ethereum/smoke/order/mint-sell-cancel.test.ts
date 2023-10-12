import { ActivityType, Blockchain } from "@rarible/api-client"
import type { UnionAddress } from "@rarible/types"
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
import { getCollection } from "../../../common/helpers"
import { cancel } from "../../../common/atoms-tests/cancel"
import { getCurrency } from "../../../common/currency"
import { getActivitiesByItem } from "../../../common/api-helpers/activity-helper"
import { getEndDateAfterMonthAsDate } from "../../../common/utils"
import { createCollection } from "../../../common/atoms-tests/create-collection"

function suites(): {
	blockchain: Blockchain,
	description: string,
	isLazy: boolean,
	wallets: { seller: BlockchainWallet, buyer: BlockchainWallet },
	deployRequest: CreateCollectionRequestSimplified,
	mintRequest: (address: UnionAddress) => MintRequest,
	currency: string,
	sellRequest: (currency: RequestCurrency) => Promise<OrderRequest>,
}[] {
	return [
		{
			blockchain: Blockchain.ETHEREUM,
			description: "ERC721 <=> ETH",
			isLazy: false,
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
			isLazy: false,
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
			description: "ERC721_lazy <=> ETH",
			isLazy: true,
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
			description: "ERC721_lazy <=> ERC20",
			isLazy: true,
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
			description: "ERC1155 <=> ETH",
			isLazy: false,
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
					amount: 20,
					price: "0.0000000000000001",
					currency: currency,
					expirationDate: getEndDateAfterMonthAsDate(),
				}
			},
		},
		{
			blockchain: Blockchain.ETHEREUM,
			description: "ERC1155 <=> ERC20",
			isLazy: false,
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
			currency: "ERC20",
			sellRequest: async (currency: RequestCurrency): Promise<OrderRequest> => {
				return {
					amount: 20,
					price: "10",
					currency: currency,
					expirationDate: getEndDateAfterMonthAsDate(),
				}
			},
		},
		{
			blockchain: Blockchain.ETHEREUM,
			description: "ERC1155_lazy <=> ETH",
			isLazy: true,
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
			currency: "ETH",
			sellRequest: async (currency: RequestCurrency): Promise<OrderRequest> => {
				return {
					amount: 20,
					price: "0.0000000000000001",
					currency: currency,
					expirationDate: getEndDateAfterMonthAsDate(),
				}
			},
		},
		{
			blockchain: Blockchain.ETHEREUM,
			description: "ERC1155_lazy <=> ERC20",
			isLazy: true,
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
					amount: 20,
					price: "10",
					currency: currency,
					expirationDate: getEndDateAfterMonthAsDate(),
				}
			},
		},
	]
}

describe.each(suites())("$blockchain mint => sell => cancel", (suite) => {
	const { seller: sellerWallet } = suite.wallets
	const sellerSdk = createSdk(suite.blockchain, sellerWallet)

	test(suite.description, async () => {
		const sellerWalletAddress = await getWalletAddressFull(sellerWallet)

		const { address } = await createCollection(sellerSdk, sellerWallet, suite.deployRequest)
		const collection = await getCollection(sellerSdk, address)

		const { nft } = await mint(sellerSdk, sellerWallet, { collection },
			suite.mintRequest(sellerWalletAddress.unionAddress))

		const requestCurrency = await getCurrency(suite.wallets, suite.currency)
		const orderRequest = await suite.sellRequest(requestCurrency)

		const sellOrder = await sell(sellerSdk, sellerWallet, { itemId: nft.id }, orderRequest)

		await getActivitiesByItem(sellerSdk, nft.id,
			[ActivityType.LIST],
			[ActivityType.LIST])

		await cancel(sellerSdk, sellerWallet, { orderId: sellOrder.id })

		const NORMAL_ACTIVITIES = [ActivityType.LIST, ActivityType.MINT, ActivityType.CANCEL_LIST]
		const LAZY_ACTIVITIES = [ActivityType.LIST, ActivityType.CANCEL_LIST] // lazy items dont mint onchain

		await getActivitiesByItem(sellerSdk, nft.id,
			[ActivityType.MINT, ActivityType.LIST, ActivityType.CANCEL_LIST],
			suite.isLazy ? LAZY_ACTIVITIES : NORMAL_ACTIVITIES
		)
	})
})
