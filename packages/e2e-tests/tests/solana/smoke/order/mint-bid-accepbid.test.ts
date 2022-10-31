import { ActivityType, Blockchain } from "@rarible/api-client"
import type { UnionAddress } from "@rarible/types"
import { toBigNumber } from "@rarible/types"
import type { MintRequest } from "@rarible/sdk/node/types/nft/mint/mint-request.type"
import type { BlockchainWallet } from "@rarible/sdk-wallet"
import type { RequestCurrency } from "@rarible/sdk/src/common/domain"
import type { OrderRequest } from "@rarible/sdk/src/types/order/common"
import type { CreateCollectionRequestSimplified } from "@rarible/sdk/node/types/nft/deploy/simplified"
import { getSolanaWallet, getWalletAddressFull } from "../../../common/wallet"
import { createSdk } from "../../../common/create-sdk"
import { mint } from "../../../common/atoms-tests/mint"
import { getCollection } from "../../../common/helpers"
import { bid } from "../../../common/atoms-tests/bid"
import { acceptBid } from "../../../common/atoms-tests/accept-bid"
import { testsConfig } from "../../../common/config"
import { getCurrency } from "../../../common/currency"
import { awaitForOwnershipValue } from "../../../common/api-helpers/ownership-helper"
import { getActivitiesByItem } from "../../../common/api-helpers/activity-helper"
import { deployCollectionDeployRequest } from "../../common/defaults"
import { createCollection } from "../../../common/atoms-tests/create-collection"

function suites(): {
	blockchain: Blockchain,
	description: string,
	wallets: { seller: BlockchainWallet, buyer: BlockchainWallet },
	deployRequest: CreateCollectionRequestSimplified,
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
			deployRequest: deployCollectionDeployRequest,
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
					price: toBigNumber("0.001"),
					currency: currency,
				}
			},
		},
	]
}

describe.skip.each(suites())("$blockchain mint => bid => acceptBid", (suite) => {
	const {
		seller: sellerWallet,
		buyer: buyerWallet,
	} = suite.wallets

	test(suite.description, async () => {
		const sellerSdk = await createSdk(suite.blockchain, sellerWallet)
		const buyerSdk = await createSdk(suite.blockchain, buyerWallet)

		const walletAddressSeller = await getWalletAddressFull(sellerWallet)
		const walletAddressBuyer = await getWalletAddressFull(buyerWallet)

		const { address: collectionId } = await createCollection(sellerSdk, sellerWallet, suite.deployRequest)
		const collection = await getCollection(sellerSdk, collectionId)

		const { nft } = await mint(sellerSdk, sellerWallet, { collection },
			suite.mintRequest(walletAddressSeller.unionAddress))

		const requestCurrency = await getCurrency(suite.wallets, suite.currency)
		const bidRequest = await suite.bidRequest(requestCurrency)

		const bidOrder = await bid(buyerSdk, buyerWallet, { itemId: nft.id }, bidRequest)

		await getActivitiesByItem(buyerSdk, nft.id,
			[ActivityType.BID],
			[ActivityType.BID],
		)

		await acceptBid(sellerSdk, sellerWallet, { orderId: bidOrder.id }, { amount: bidRequest.amount || 1 })

		await awaitForOwnershipValue(buyerSdk, nft.id, walletAddressBuyer.address, toBigNumber(String(bidRequest.amount)))

		await getActivitiesByItem(buyerSdk, nft.id,
			[ActivityType.TRANSFER, ActivityType.MINT, ActivityType.BID],
			[ActivityType.TRANSFER, ActivityType.MINT, ActivityType.BID])
	})
})
