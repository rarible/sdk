import { ActivityType, Blockchain } from "@rarible/api-client"
import type { UnionAddress } from "@rarible/types"
import { toBigNumber } from "@rarible/types"
import type { MintRequest } from "@rarible/sdk/build/types/nft/mint/mint-request.type"
import type { BlockchainWallet } from "@rarible/sdk-wallet"
import type { RequestCurrency } from "@rarible/sdk/src/common/domain"
import type { OrderRequest } from "@rarible/sdk/src/types/order/common"
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
import { testsConfig } from "../../../common/config"
import { getCurrency } from "../../../common/currency"
import { awaitForOwnershipValue } from "../../../common/api-helpers/ownership-helper"
import { getActivitiesByItem } from "../../../common/api-helpers/activity-helper"

function suites(): {
	blockchain: Blockchain,
	description: string,
	wallets: { seller: BlockchainWallet, buyer: BlockchainWallet },
	collectionId: string,
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
			collectionId: testsConfig.variables.ETHEREUM_COLLECTION_ERC_721,
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
			collectionId: testsConfig.variables.ETHEREUM_COLLECTION_ERC_721,
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
					price: "0.0000000000000001",
					currency: currency,
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
			collectionId: testsConfig.variables.ETHEREUM_COLLECTION_ERC_721,
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
					price: "0.0000000000000001",
					currency: currency,
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
			collectionId: testsConfig.variables.ETHEREUM_COLLECTION_ERC_721,
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
			collectionId: testsConfig.variables.ETHEREUM_COLLECTION_ERC_1155,
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
			collectionId: testsConfig.variables.ETHEREUM_COLLECTION_ERC_1155,
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
					price: "0.0000000000000001",
					currency: currency,
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
			collectionId: testsConfig.variables.ETHEREUM_COLLECTION_ERC_1155,
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
			collectionId: testsConfig.variables.ETHEREUM_COLLECTION_ERC_1155,
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
					price: "0.0000000000000001",
					currency: currency,
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

		const collection = await getCollection(sellerSdk, suite.collectionId)

		const { nft } = await mint(sellerSdk, sellerWallet, { collection },
			suite.mintRequest(walletAddressSeller.unionAddress))

		const requestCurrency = await getCurrency(suite.wallets, suite.currency)
		const orderRequest = await suite.sellRequest(requestCurrency)

		const sellOrder = await sell(sellerSdk, sellerWallet, { itemId: nft.id }, orderRequest)

		await getActivitiesByItem(sellerSdk, nft.id,
			[ActivityType.LIST],
			[ActivityType.LIST])

		const buyAmount = orderRequest.amount
		await buy(buyerSdk, buyerWallet, nft.id, { orderId: sellOrder.id }, { amount: buyAmount })

		await awaitOrderStock(sellerSdk, sellOrder.id, toBigNumber("0"))
		await awaitForOwnershipValue(buyerSdk, nft.id, walletAddressBuyer.address, toBigNumber(String(buyAmount)))

		await getActivitiesByItem(sellerSdk, nft.id,
			[ActivityType.SELL, ActivityType.TRANSFER, ActivityType.MINT, ActivityType.LIST],
			[ActivityType.TRANSFER, ActivityType.SELL, ActivityType.LIST, ActivityType.MINT])
	})
})
