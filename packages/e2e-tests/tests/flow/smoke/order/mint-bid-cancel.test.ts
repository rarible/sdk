import { ActivityType, Blockchain } from "@rarible/api-client"
import type { UnionAddress } from "@rarible/types"
import type { MintRequest } from "@rarible/sdk/build/types/nft/mint/mint-request.type"
import type { BlockchainWallet } from "@rarible/sdk-wallet"
import type { RequestCurrency } from "@rarible/sdk/src/common/domain"
import type { OrderRequest } from "@rarible/sdk/src/types/order/common"
import { getFlowBuyerWallet, getFlowSellerWallet, getWalletAddressFull } from "../../../common/wallet"
import { createSdk } from "../../../common/create-sdk"
import { mint } from "../../../common/atoms-tests/mint"
import { getCollection } from "../../../common/helpers"
import { bid } from "../../../common/atoms-tests/bid"
import { testsConfig } from "../../../common/config"
import { getCurrency } from "../../../common/currency"
import { cancel } from "../../../common/atoms-tests/cancel"
import { getActivitiesByItem } from "../../../common/api-helpers/activity-helper"

function suites(): {
	blockchain: Blockchain,
	description: string,
	wallets: { seller: BlockchainWallet, buyer: BlockchainWallet },
	collectionId: string,
	mintRequest: (creatorAddress: UnionAddress) => MintRequest,
	currency: string,
	bidRequest: (currency: RequestCurrency) => Promise<OrderRequest>
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
			currency: "FLOW_FT",
			bidRequest: async (currency: RequestCurrency): Promise<OrderRequest> => {
				return {
					amount: 1,
					price: "0.0001",
					currency: currency,
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

		await getActivitiesByItem(buyerSdk, nft.id,
			[ActivityType.BID],
			[ActivityType.BID])

		await cancel(buyerSdk, buyerWallet, { orderId: bidOrder.id })

		await getActivitiesByItem(buyerSdk, nft.id,
			[ActivityType.MINT, ActivityType.BID, ActivityType.CANCEL_BID],
			[ActivityType.MINT, ActivityType.BID, ActivityType.CANCEL_BID])
	})
})
