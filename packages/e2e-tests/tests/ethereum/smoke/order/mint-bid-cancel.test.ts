import { ActivityType, Blockchain } from "@rarible/api-client"
import type { UnionAddress } from "@rarible/types"
import type { MintRequest } from "@rarible/sdk/build/types/nft/mint/mint-request.type"
import type { BlockchainWallet } from "@rarible/sdk-wallet"
import type { RequestCurrency } from "@rarible/sdk/src/common/domain"
import type { OrderRequest } from "@rarible/sdk/src/types/order/common"
import { retry } from "@rarible/sdk/build/common/retry"
import {
	getEthereumWallet,
	getEthereumWalletBuyer,
	getWalletAddressFull,
} from "../../../common/wallet"
import { createSdk } from "../../../common/create-sdk"
import { mint } from "../../../common/atoms-tests/mint"
import { getCollection } from "../../../common/helpers"
import { bid } from "../../../common/atoms-tests/bid"
import { getCurrency } from "../../../common/currency"
import { cancel } from "../../../common/atoms-tests/cancel"
import { getActivitiesByItem } from "../../../common/api-helpers/activity-helper"
import { getEndDateAfterMonthAsDate } from "../../../common/utils"

function suites(): {
	blockchain: Blockchain,
	description: string,
	isLazy: boolean,
	wallets: { seller: BlockchainWallet, buyer: BlockchainWallet },
	collectionId: string,
	mintRequest: (creatorAddress: UnionAddress) => MintRequest,
	currency: string,
	bidRequest: (currency: RequestCurrency) => Promise<OrderRequest>,
}[] {
	return [
		{
			blockchain: Blockchain.ETHEREUM,
			description: "ERC721 <=> ERC20",
			isLazy: false,
			wallets: {
				seller: getEthereumWallet(),
				buyer: getEthereumWalletBuyer(),
			},
			collectionId: "ETHEREUM:0x74FeD9e7c29907313F987dff0BF13edfd884c5a9",
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
		},
		{
			blockchain: Blockchain.ETHEREUM,
			description: "ERC721_lazy <=> ERC20",
			isLazy: true,
			wallets: {
				seller: getEthereumWallet(),
				buyer: getEthereumWalletBuyer(),
			},
			collectionId: "ETHEREUM:0x1E5D1745E688a20cBa7d52B6CD1b9Ca7e8297BD6",
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
		},
		{
			blockchain: Blockchain.ETHEREUM,
			description: "ERC1155 <=> ERC20",
			isLazy: false,
			wallets: {
				seller: getEthereumWallet(),
				buyer: getEthereumWalletBuyer(),
			},
			collectionId: "ETHEREUM:0x75295818ed5CC95F4d430ed314Ad04aF6Da5628b",
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
		},
		{
			blockchain: Blockchain.ETHEREUM,
			description: "ERC1155_lazy <=> ERC20",
			isLazy: true,
			wallets: {
				seller: getEthereumWallet(),
				buyer: getEthereumWalletBuyer(),
			},
			collectionId: "ETHEREUM:0x7Fe23b1f19B4590869B9EDFfb857aFe3834b6941",
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
		},
	]
}

describe.each(suites())("$blockchain mint => bid => cancel", (suite) => {
	const {
		seller: sellerWallet,
		buyer: buyerWallet,
	} = suite.wallets
	const sellerSdk = createSdk(suite.blockchain, sellerWallet)
	const buyerSdk = createSdk(suite.blockchain, buyerWallet)

	test(suite.description, async () => {
		const walletAddressSeller = await getWalletAddressFull(sellerWallet)

		const collection = await getCollection(sellerSdk, suite.collectionId)
		const { nft } = await mint(sellerSdk, sellerWallet, { collection },
			suite.mintRequest(walletAddressSeller.unionAddress))

		const requestCurrency = await getCurrency(suite.wallets, suite.currency)
		const bidRequest = await suite.bidRequest(requestCurrency)

		const bidOrder = await bid(buyerSdk, buyerWallet, { itemId: nft.id }, bidRequest)

		await retry(40, 3000, async () => {
			await getActivitiesByItem(buyerSdk, nft.id,
				[ActivityType.BID],
				[ActivityType.BID])
		})

		await cancel(buyerSdk, buyerWallet, { orderId: bidOrder.id })

		const NORMAL_ACTIVITIES = [ActivityType.MINT, ActivityType.BID, ActivityType.CANCEL_BID]
		const LAZY_ACTIVITIES = [ActivityType.BID, ActivityType.CANCEL_BID] // lazy items dont mint onchain

		await getActivitiesByItem(buyerSdk, nft.id,
			[ActivityType.MINT, ActivityType.BID, ActivityType.CANCEL_BID],
			suite.isLazy ? LAZY_ACTIVITIES : NORMAL_ACTIVITIES
		)
	})
})
