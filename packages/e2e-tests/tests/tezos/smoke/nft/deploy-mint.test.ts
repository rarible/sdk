import { ActivityType, Blockchain } from "@rarible/api-client"
import type { UnionAddress } from "@rarible/types"
import type { MintRequest } from "@rarible/sdk/node/types/nft/mint/mint-request.type"
import type { BlockchainWallet } from "@rarible/sdk-wallet"
import type { CreateCollectionRequestSimplified } from "@rarible/sdk/node/types/nft/deploy/simplified"
import { getTezosTestWallet, getWalletAddressFull } from "../../../common/wallet"
import { createSdk } from "../../../common/create-sdk"
import { mint } from "../../../common/atoms-tests/mint"
import { getCollection } from "../../../common/helpers"
import { createCollection } from "../../../common/atoms-tests/create-collection"
import { getActivitiesByItem } from "../../../common/api-helpers/activity-helper"

function suites(): {
	blockchain: Blockchain,
	description: string,
	wallet: BlockchainWallet,
	deployRequest: CreateCollectionRequestSimplified,
	mintRequest: (address: UnionAddress) => MintRequest,
	activities: Array<ActivityType>
}[] {
	return [
		{
			blockchain: Blockchain.TEZOS,
			description: "NFT",
			wallet: getTezosTestWallet(),
			deployRequest: {
				blockchain: Blockchain.TEZOS,
				type: "NFT",
				name: "NFT",
				homepage: "https://ipfs.io/ipfs/QmTKxwnqqxTxH4HE3UVM9yoJFZgbsZ8CuqqRFZCSWBF53m",
				isPublic: true,
			} as CreateCollectionRequestSimplified,
			mintRequest: (walletAddress: UnionAddress) => {
				return {
					uri: "ipfs:/test",
					creators: [{
						account: walletAddress,
						value: 10000,
					}],
					royalties: [],
					lazyMint: false,
					supply: 1,
				}
			},
			activities: [ActivityType.MINT],
		},
		{
			blockchain: Blockchain.TEZOS,
			description: "MT",
			wallet: getTezosTestWallet(),
			deployRequest: {
				blockchain: Blockchain.TEZOS,
				type: "MT",
				name: "MT",
				homepage: "https://ipfs.io/ipfs/QmTKxwnqqxTxH4HE3UVM9yoJFZgbsZ8CuqqRFZCSWBF53m",
				isPublic: false,
			} as CreateCollectionRequestSimplified,
			mintRequest: (walletAddress: UnionAddress) => {
				return {
					uri: "ipfs:/test",
					creators: [{
						account: walletAddress,
						value: 10000,
					}],
					royalties: [],
					lazyMint: false,
					supply: 15,
				}
			},
			activities: [ActivityType.MINT],
		},
	]
}

describe.each(suites())("$blockchain deploy => mint", (suite) => {
	const wallet = suite.wallet

	test(suite.description, async () => {
		const sdk = await createSdk(suite.blockchain, wallet)

		const walletAddress = await getWalletAddressFull(wallet)
		const { address } = await createCollection(sdk, wallet, suite.deployRequest)

		const collection = await getCollection(sdk, address)

		const { nft } = await mint(sdk, wallet, { collection },
			suite.mintRequest(walletAddress.unionAddress))

		await getActivitiesByItem(sdk, nft.id, [ActivityType.MINT], suite.activities)

	})
})
