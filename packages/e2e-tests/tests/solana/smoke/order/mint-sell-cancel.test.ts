import { ActivityType, Blockchain } from "@rarible/api-client"
import type { UnionAddress } from "@rarible/types"
import { toBigNumber } from "@rarible/types"
import type { MintRequest } from "@rarible/sdk/build/types/nft/mint/mint-request.type"
import type { BlockchainWallet } from "@rarible/sdk-wallet"
import type { RequestCurrency } from "@rarible/sdk/src/common/domain"
import type { OrderRequest } from "@rarible/sdk/src/types/order/common"
import type { CreateCollectionRequestSimplified } from "@rarible/sdk/build/types/nft/deploy/simplified"
import { sell } from "../../../common/atoms-tests/sell"
import { getSolanaWallet, getWalletAddressFull } from "../../../common/wallet"
import { createSdk } from "../../../common/create-sdk"
import { mint } from "../../../common/atoms-tests/mint"
import { getCollection } from "../../../common/helpers"
import { cancel } from "../../../common/atoms-tests/cancel"
import { testsConfig } from "../../../common/config"
import { getCurrency } from "../../../common/currency"
import { getActivitiesByItem } from "../../../common/api-helpers/activity-helper"
import { deployCollectionDeployRequest } from "../../common/defaults"
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
			blockchain: Blockchain.SOLANA,
			description: "NFT <=> SOLANA_SOL",
			wallets: {
				seller: getSolanaWallet(0),
				buyer: getSolanaWallet(1),
			},
			deployRequest: deployCollectionDeployRequest,
			mintRequest: (walletAddress: UnionAddress): MintRequest => {
				return {
					uri: testsConfig.variables.SOLANA_URI,
					creators: [{
						account: walletAddress,
						value: 10000,
					}],
					royalties: [],
					lazyMint: false,
					supply: 1,
				}
			},
			currency: "SOLANA_SOL",
			sellRequest: async (currency: RequestCurrency): Promise<OrderRequest> => {
				return {
					amount: 1,
					price: toBigNumber("0.001"),
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

		const { address: collectionId } = await createCollection(sellerSdk, sellerWallet, suite.deployRequest)
		const collection = await getCollection(sellerSdk, collectionId)

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
