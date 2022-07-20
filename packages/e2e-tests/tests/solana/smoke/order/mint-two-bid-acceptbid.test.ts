import { Blockchain } from "@rarible/api-client"
import type { UnionAddress } from "@rarible/types"
import { toBigNumber } from "@rarible/types"
import { retry } from "@rarible/sdk/src/common/retry"
import type { MintRequest } from "@rarible/sdk/build/types/nft/mint/mint-request.type"
import type { BlockchainWallet } from "@rarible/sdk-wallet"
import type { RequestCurrency } from "@rarible/sdk/src/common/domain"
import type { OrderRequest } from "@rarible/sdk/src/types/order/common"
import { getSolanaWallet, getWalletAddressFull } from "../../../common/wallet"
import { createSdk } from "../../../common/create-sdk"
import { mint } from "../../../common/atoms-tests/mint"
import { getCollection } from "../../../common/helpers"
import { bid } from "../../../common/atoms-tests/bid"
import { acceptBid } from "../../../common/atoms-tests/accept-bid"
import { testsConfig } from "../../../common/config"
import { getCurrency } from "../../../common/currency"
import { awaitForOwnershipValue } from "../../../common/api-helpers/ownership-helper"
import { getOrdersByIds } from "../../../common/api-helpers/order-helper"

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
			blockchain: Blockchain.SOLANA,
			description: "NFT <=> SOLANA_SOL",
			wallets: {
				seller: getSolanaWallet(0),
				buyer: getSolanaWallet(1),
			},
			collectionId: testsConfig.variables.SOLANA_COLLECTION,
			mintRequest: (creatorAddress: UnionAddress): MintRequest => {
				return {
					uri: testsConfig.variables.SOLANA_URI,
					creators: [{
						account: creatorAddress,
						value: 10000,
					}],
					royalties: [],
					lazyMint: false,
					supply: 1,
				}
			},
			currency: "SOLANA_SOL",
			bidRequest: async (currency: RequestCurrency): Promise<OrderRequest> => {
				return {
					amount: 1,
					price: toBigNumber("0.005"),
					currency: currency,
				}
			},
		},
	]
}

describe.each(suites())("$blockchain mint => two bid => acceptBid", (suite) => {
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

		const { nft: nft1 } = await mint(sellerSdk, sellerWallet, { collection },
			suite.mintRequest(walletAddressSeller.unionAddress))

		const { nft: nft2 } = await mint(sellerSdk, sellerWallet, { collection },
			suite.mintRequest(walletAddressSeller.unionAddress))

		const requestCurrency = await getCurrency(suite.wallets, suite.currency)
		const bidRequest = await suite.bidRequest(requestCurrency)

		const bidOrder1 = await bid(buyerSdk, buyerWallet, { itemId: nft1.id }, bidRequest)
		const bidOrder2 = await bid(buyerSdk, buyerWallet, { itemId: nft2.id }, bidRequest)

		await acceptBid(sellerSdk, sellerWallet, { orderId: bidOrder1.id }, { amount: bidRequest.amount })

		await awaitForOwnershipValue(buyerSdk, nft1.id, walletAddressBuyer.address, toBigNumber(String(bidRequest.amount)))

		await retry(10, 2000, async () => {
			const ordersByIds = await getOrdersByIds(sellerSdk, bidOrder2.id)
			expect(ordersByIds.orders[0].status).toEqual("INACTIVE")
		})
	})
})
