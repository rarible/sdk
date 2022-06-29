import { ActivityType, Blockchain } from "@rarible/api-client"
import type { UnionAddress } from "@rarible/types"
import type { MintRequest } from "@rarible/sdk/build/types/nft/mint/mint-request.type"
import type { BlockchainWallet } from "@rarible/sdk-wallet"
import type { RequestCurrency } from "@rarible/sdk/src/common/domain"
import type { OrderRequest } from "@rarible/sdk/src/types/order/common"
import { sell } from "../../../common/atoms-tests/sell"
import { getTezosTestWallet, getWalletAddressFull } from "../../../common/wallet"
import { createSdk } from "../../../common/create-sdk"
import { mint } from "../../../common/atoms-tests/mint"
import { getCollection } from "../../../common/helpers"
import { cancel } from "../../../common/atoms-tests/cancel"
import { testsConfig } from "../../../common/config"
import { getCurrency } from "../../../common/currency"
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
			blockchain: Blockchain.TEZOS,
			description: "NFT <=> XTZ",
			wallets: {
				seller: getTezosTestWallet(0),
				buyer: getTezosTestWallet(1),
			},
			collectionId: testsConfig.variables.TEZOS_COLLECTION_ID_NFT,
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
			currency: "XTZ",
			sellRequest: async (currency: RequestCurrency): Promise<OrderRequest> => {
				return {
					amount: 1,
					price: "0.02",
					currency: currency,
				}
			},
		},
		{
			blockchain: Blockchain.TEZOS,
			description: "MT <=> XTZ",
			wallets: {
				seller: getTezosTestWallet(0),
				buyer: getTezosTestWallet(1),
			},
			collectionId: testsConfig.variables.TEZOS_COLLECTION_ID_MT,
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
			currency: "XTZ",
			sellRequest: async (currency: RequestCurrency): Promise<OrderRequest> => {
				return {
					amount: 5,
					price: "0.02",
					currency: currency,
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

		const collection = await getCollection(sellerSdk, suite.collectionId)

		const { nft } = await mint(sellerSdk, sellerWallet, { collection },
			suite.mintRequest(sellerWalletAddress.unionAddress))

		const requestCurrency = await getCurrency(suite.wallets, suite.currency)
		const orderRequest = await suite.sellRequest(requestCurrency)

		const sellOrder = await sell(sellerSdk, sellerWallet, { itemId: nft.id }, orderRequest)

		await getActivitiesByItem(sellerSdk, nft.id,
			[ActivityType.LIST],
			[ActivityType.LIST])

		await cancel(sellerSdk, sellerWallet, { orderId: sellOrder.id })

		await getActivitiesByItem(sellerSdk, nft.id,
			[ActivityType.MINT, ActivityType.LIST, ActivityType.CANCEL_LIST],
			[ActivityType.LIST, ActivityType.MINT, ActivityType.CANCEL_LIST])
	})
})
