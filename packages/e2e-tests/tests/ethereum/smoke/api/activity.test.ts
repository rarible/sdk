import { ActivityType, Blockchain } from "@rarible/api-client"
import type { UnionAddress } from "@rarible/types"
import type { MintRequest } from "@rarible/sdk/build/types/nft/mint/mint-request.type"
import type { BlockchainWallet } from "@rarible/sdk-wallet"
import type {
	GetActivitiesByCollection200,
	GetActivitiesByItem200,
	GetActivitiesByUser200,
	GetAllActivities200,
} from "@rarible/api-client/build/apis/ActivityControllerApi"
import { UserActivityType } from "@rarible/api-client/build/models"
import { getEthereumWallet, getWalletAddressFull } from "../../../common/wallet"
import { createSdk } from "../../../common/create-sdk"
import { mint } from "../../../common/atoms-tests/mint"
import { getCollection } from "../../../common/helpers"
import { testsConfig } from "../../../common/config"
import {
	getActivitiesByCollection,
	getActivitiesByCollectionRaw,
	getActivitiesByItem,
	getActivitiesByItemRaw,
	getActivitiesByUser,
	getActivitiesByUserRaw,
	getAllActivities,
	getAllActivitiesRaw,
} from "../../../common/api-helpers/activity-helper"

function suites(): {
	blockchain: Blockchain,
	wallets: { seller: BlockchainWallet },
	collectionId: string,
	mintRequest: (address: UnionAddress) => MintRequest
}[] {
	return [
		{
			blockchain: Blockchain.ETHEREUM,
			wallets: { seller: getEthereumWallet() },
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
		},
	]
}

describe.each(suites())("$blockchain api => activity", (suite) => {
	const { seller: sellerWallet } = suite.wallets
	const sellerSdk = createSdk(suite.blockchain, sellerWallet)

	test("activity controller", async () => {
		const walletAddressSeller = await getWalletAddressFull(sellerWallet)

		const collection = await getCollection(sellerSdk, suite.collectionId)

		const { nft } = await mint(sellerSdk, sellerWallet, { collection },
			suite.mintRequest(walletAddressSeller.unionAddress))

		const activitiesByCollection = await getActivitiesByCollection(sellerSdk,
			suite.collectionId, [ActivityType.MINT])
		expect(activitiesByCollection.activities.length).toBeGreaterThanOrEqual(1)

		const activitiesByCollectionRaw = await getActivitiesByCollectionRaw(sellerSdk,
			suite.collectionId, [ActivityType.MINT]) as GetActivitiesByCollection200
		expect(activitiesByCollectionRaw.value.activities.length).toBeGreaterThanOrEqual(1)

		const activitiesByItem = await getActivitiesByItem(sellerSdk, nft.id, [ActivityType.MINT])
		expect(activitiesByItem.activities.length).toBeGreaterThanOrEqual(1)

		const activitiesByItemRaw = await getActivitiesByItemRaw(sellerSdk,
			nft.id, [ActivityType.MINT]) as GetActivitiesByItem200
		expect(activitiesByItemRaw.value.activities.length).toBeGreaterThanOrEqual(1)

		const activitiesByUser = await getActivitiesByUser(sellerSdk,
			[walletAddressSeller.unionAddress], [UserActivityType.MINT])
		expect(activitiesByUser.activities.length).toBeGreaterThanOrEqual(1)

		const activitiesByUserRaw = await getActivitiesByUserRaw(sellerSdk,
			[walletAddressSeller.unionAddress], [UserActivityType.MINT]) as GetActivitiesByUser200
		expect(activitiesByUserRaw.value.activities.length).toBeGreaterThanOrEqual(1)

		const allActivities = await getAllActivities(sellerSdk,
			[suite.blockchain], [ActivityType.MINT])
		expect(allActivities.activities.length).toBeGreaterThanOrEqual(1)

		const allActivitiesRaw = await getAllActivitiesRaw(sellerSdk,
			[suite.blockchain], [ActivityType.MINT]) as GetAllActivities200
		expect(allActivitiesRaw.value.activities.length).toBeGreaterThanOrEqual(1)
	})
})
