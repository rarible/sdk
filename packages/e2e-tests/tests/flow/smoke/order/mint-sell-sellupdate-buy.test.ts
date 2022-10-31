import { Blockchain } from "@rarible/api-client"
import type { UnionAddress } from "@rarible/types"
import { toBigNumber } from "@rarible/types"
import type { MintRequest } from "@rarible/sdk/build/types/nft/mint/mint-request.type"
import type { BlockchainWallet } from "@rarible/sdk-wallet"
import type { RequestCurrency } from "@rarible/sdk/src/common/domain"
import type { OrderRequest } from "@rarible/sdk/src/types/order/common"
import type { OrderUpdateRequest } from "@rarible/sdk/build/types/order/common"
import { sell } from "../../../common/atoms-tests/sell"
import { getFlowBuyerWallet, getFlowSellerWallet, getWalletAddressFull } from "../../../common/wallet"
import { createSdk } from "../../../common/create-sdk"
import { mint } from "../../../common/atoms-tests/mint"
import { awaitOrderStock, getCollection } from "../../../common/helpers"
import { buy } from "../../../common/atoms-tests/buy"
import { testsConfig } from "../../../common/config"
import { getCurrency } from "../../../common/currency"
import { awaitForOwnershipValue } from "../../../common/api-helpers/ownership-helper"
import { sellUpdate } from "../../../common/atoms-tests/sell-update"

function suites(): {
	blockchain: Blockchain,
	description: string,
	wallets: { seller: BlockchainWallet, buyer: BlockchainWallet },
	collectionId: string,
	mintRequest: (address: UnionAddress) => MintRequest,
	currency: string,
	sellRequest: (currency: RequestCurrency) => Promise<OrderRequest>,
	updateSellRequest: OrderUpdateRequest
}[] {
	return [
		{
			blockchain: Blockchain.FLOW,
			description: "NFT <=> FLOW_FT",
			wallets: {
				seller: getFlowSellerWallet(),
				buyer: getFlowBuyerWallet(),
			},
			collectionId: testsConfig.variables.FLOW_RARIBLE_COLLECTION,
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
			currency: "FLOW_FT",
			sellRequest: async (currency: RequestCurrency): Promise<OrderRequest> => {
				return {
					amount: 1,
					price: "0.0002",
					currency: currency,
				}
			},
			updateSellRequest: {
				price: "0.0001",
			},
		},
	]
}

describe.skip.each(suites())("$blockchain mint => sell => sellUpdate => buy", (suite) => {
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

		const order = await sellUpdate(sellerSdk, sellerWallet, { orderId: sellOrder.id }, suite.updateSellRequest)

		await buy(buyerSdk, buyerWallet, nft.id, { orderId: order.id }, { amount: orderRequest.amount || 1 })

		await awaitOrderStock(sellerSdk, order.id, toBigNumber("0"))
		await awaitForOwnershipValue(buyerSdk, nft.id, walletAddressBuyer.address, toBigNumber(String(orderRequest.amount)))
	})
})
