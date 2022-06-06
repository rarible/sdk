import { Blockchain } from "@rarible/api-client"
import type { UnionAddress } from "@rarible/types"
import type { MintRequest } from "@rarible/sdk/build/types/nft/mint/mint-request.type"
import type { BlockchainWallet } from "@rarible/sdk-wallet"
import type { RequestCurrency } from "@rarible/sdk/src/common/domain"
import type { OrderRequest } from "@rarible/sdk/src/types/order/common"
import type {
	GetOrderBidsByItem200,
	GetOrdersAll200,
	GetSellOrders200,
	GetSellOrdersByItem200,
	GetSellOrdersByMaker200,
} from "@rarible/api-client/build/apis/OrderControllerApi"
import { sell } from "../../../common/atoms-tests/sell"
import { getEthereumWallet, getEthereumWalletBuyer, getWalletAddressFull } from "../../../common/wallet"
import { createSdk } from "../../../common/create-sdk"
import { mint } from "../../../common/atoms-tests/mint"
import { getCollection } from "../../../common/helpers"
import { testsConfig } from "../../../common/config"
import { getCurrency } from "../../../common/currency"
import {
	getOrderBidsByItem,
	getOrderBidsByItemRaw,
	getOrdersAll,
	getOrdersAllRaw,
	getOrdersByIds,
	getOrdersByIdsRaw,
	getSellOrders,
	getSellOrdersByItem,
	getSellOrdersByItemRaw,
	getSellOrdersByMaker,
	getSellOrdersByMakerRaw,
	getSellOrdersRaw,
} from "../../../common/api-helpers/order-helper"
import { bid } from "../../../common/atoms-tests/bid"

function suites(): {
	blockchain: Blockchain,
	wallets: { seller: BlockchainWallet, buyer: BlockchainWallet },
	collectionId: string,
	mintRequest: (address: UnionAddress) => MintRequest,
	currency: string,
	sellRequest: (currency: RequestCurrency) => Promise<OrderRequest>,
	bidRequest: (currency: RequestCurrency) => Promise<OrderRequest>
}[] {
	return [
		{
			blockchain: Blockchain.ETHEREUM,
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
			currency: "ERC20",
			sellRequest: async (currency: RequestCurrency): Promise<OrderRequest> => {
				return {
					amount: 3,
					price: "0.0000000000000001",
					currency: currency,
				}
			},
			bidRequest: async (currency: RequestCurrency): Promise<OrderRequest> => {
				return {
					amount: 5,
					price: "0.0000000000000001",
					currency: currency,
				}
			},
		},
	]
}

describe.each(suites())("$blockchain api => order", (suite) => {
	const {
		seller: sellerWallet,
		buyer: buyerWallet,
	} = suite.wallets
	const sellerSdk = createSdk(suite.blockchain, sellerWallet)
	const buyerSdk = createSdk(suite.blockchain, buyerWallet)

	test("order controller", async () => {
		const walletAddressSeller = await getWalletAddressFull(sellerWallet)

		const collection = await getCollection(sellerSdk, suite.collectionId)

		const { nft } = await mint(sellerSdk, sellerWallet, { collection },
			suite.mintRequest(walletAddressSeller.unionAddress))

		const requestCurrency = await getCurrency(suite.wallets, suite.currency)
		const orderRequest = await suite.sellRequest(requestCurrency)

		const sellOrder = await sell(sellerSdk, sellerWallet, { itemId: nft.id }, orderRequest)

		const ordersAll = await getOrdersAll(sellerSdk, [suite.blockchain], 2)
		expect(ordersAll.orders.length).toBeGreaterThanOrEqual(1)

		const ordersAllRaw =
            await getOrdersAllRaw(sellerSdk, [suite.blockchain], 2) as GetOrdersAll200
		expect(ordersAllRaw.value.orders.length).toBeGreaterThanOrEqual(1)

		const ordersByIds = await getOrdersByIds(sellerSdk, sellOrder.id)
		expect(ordersByIds.orders.length).toBeGreaterThanOrEqual(1)

		const ordersByIdsRaw = await getOrdersByIdsRaw(sellerSdk, sellOrder.id) as GetSellOrders200
		expect(ordersByIdsRaw.value.orders.length).toBeGreaterThanOrEqual(1)

		const sellOrders = await getSellOrders(sellerSdk, [suite.blockchain], 2)
		expect(sellOrders.orders.length).toBeGreaterThanOrEqual(1)

		const sellOrdersRaw =
            await getSellOrdersRaw(sellerSdk, [suite.blockchain], 2) as GetSellOrders200
		expect(sellOrdersRaw.value.orders.length).toBeGreaterThanOrEqual(1)

		const sellOrdersByItem = await getSellOrdersByItem(sellerSdk, nft.contract!, nft.tokenId!, 2)
		expect(sellOrdersByItem.orders.length).toBeGreaterThanOrEqual(1)

		const sellOrdersByItemRaw =
            await getSellOrdersByItemRaw(sellerSdk, nft.contract!, nft.tokenId!, 2) as GetSellOrdersByItem200
		expect(sellOrdersByItemRaw.value.orders.length).toBeGreaterThanOrEqual(1)

		const sellOrdersByMaker = await getSellOrdersByMaker(sellerSdk, walletAddressSeller.unionAddress, 2)
		expect(sellOrdersByMaker.orders.length).toBeGreaterThanOrEqual(1)

		const sellOrdersByMakerRaw =
            await getSellOrdersByMakerRaw(sellerSdk, walletAddressSeller.unionAddress, 2) as GetSellOrdersByMaker200
		expect(sellOrdersByMakerRaw.value.orders.length).toBeGreaterThanOrEqual(1)

		const bidRequest = await suite.bidRequest(requestCurrency)
		await bid(buyerSdk, buyerWallet, { itemId: nft.id }, bidRequest)

		const orderBidsByItem = await getOrderBidsByItem(sellerSdk, nft.contract!, nft.tokenId!, 2)
		expect(orderBidsByItem.orders.length).toBeGreaterThanOrEqual(1)

		const orderBidsByItemRaw =
            await getOrderBidsByItemRaw(sellerSdk, nft.contract!, nft.tokenId!, 2) as GetOrderBidsByItem200
		expect(orderBidsByItemRaw.value.orders.length).toBeGreaterThanOrEqual(1)
	})
})
