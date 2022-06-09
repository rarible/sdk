import { ActivityType, Blockchain } from "@rarible/api-client"
import type { UnionAddress } from "@rarible/types"
import { toBigNumber } from "@rarible/types"
import type { MintRequest } from "@rarible/sdk/build/types/nft/mint/mint-request.type"
import type { BlockchainWallet } from "@rarible/sdk-wallet"
import type { BurnRequest } from "@rarible/sdk/build/types/nft/burn/domain"
import type { TransferRequest } from "@rarible/sdk/build/types/nft/transfer/domain"
import { getTezosTestWallet, getWalletAddressFull } from "../../../common/wallet"
import { createSdk } from "../../../common/create-sdk"
import { mint } from "../../../common/atoms-tests/mint"
import { testsConfig } from "../../../common/config"
import { burn } from "../../../common/atoms-tests/burn"
import { transfer } from "../../../common/atoms-tests/transfer"
import { getCollectionById } from "../../../common/api-helpers/collection-helper"
import { awaitForOwnershipValue } from "../../../common/api-helpers/ownership-helper"
import { getActivitiesByItem } from "../../../common/api-helpers/activity-helper"

function suites(): {
	blockchain: Blockchain,
	description: string,
	wallets: { creator: BlockchainWallet, recipient: BlockchainWallet },
	collectionId: string,
	mintRequest: (address: UnionAddress) => MintRequest,
	transferRequest: (address: UnionAddress) => TransferRequest,
	creatorBalanceAfterTransfer: string,
	recipientBalanceAfterTransfer: string
	burnRequest: BurnRequest,
	totalBalanceAfterBurn: number
}[] {
	return [
		{
			blockchain: Blockchain.TEZOS,
			description: "NFT",
			wallets: {
				creator: getTezosTestWallet(0),
				recipient: getTezosTestWallet(1),
			},
			collectionId: testsConfig.variables.TEZOS_COLLECTION_ID_NFT,
			mintRequest: (walletAddress: UnionAddress): MintRequest => {
				return {
					uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG1",
					creators: [{
						account: walletAddress,
						value: 10000,
					}],
					royalties: [],
					lazyMint: false,
					supply: 1,
				}
			},
			transferRequest: (walletAddress: UnionAddress): TransferRequest => {
				return {
					to: walletAddress,
					amount: 1,
				}
			},
			creatorBalanceAfterTransfer: "0",
			recipientBalanceAfterTransfer: "1",
			burnRequest: {
				amount: 1,
				creators: [],
			},
			totalBalanceAfterBurn: 0,
		},
		{
			blockchain: Blockchain.TEZOS,
			description: "MT",
			wallets: {
				creator: getTezosTestWallet(0),
				recipient: getTezosTestWallet(1),
			},
			collectionId: testsConfig.variables.TEZOS_COLLECTION_ID_MT,
			mintRequest: (walletAddress: UnionAddress): MintRequest => {
				return {
					uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG1",
					creators: [{
						account: walletAddress,
						value: 10000,
					}],
					royalties: [],
					lazyMint: false,
					supply: 20,
				}
			},
			transferRequest: (walletAddress: UnionAddress): TransferRequest => {
				return {
					to: walletAddress,
					amount: 9,
				}
			},
			creatorBalanceAfterTransfer: "11",
			recipientBalanceAfterTransfer: "9",
			burnRequest: {
				amount: 4,
				creators: [],
			},
			totalBalanceAfterBurn: 16,
		},
	]
}

describe.each(suites())("$blockchain mint => transfer => burn", (suite) => {
	const {
		creator: creatorWallet,
		recipient: recipientWallet,
	} = suite.wallets
	const creatorSdk = createSdk(suite.blockchain, creatorWallet)
	const recipientSdk = createSdk(suite.blockchain, recipientWallet)

	test(suite.description, async () => {
		const creatorWalletAddress = await getWalletAddressFull(creatorWallet)
		const recipientWalletAddress = await getWalletAddressFull(recipientWallet)

		const collection = await getCollectionById(creatorSdk, suite.collectionId)

		const { nft } = await mint(creatorSdk, creatorWallet, { collection },
			suite.mintRequest(creatorWalletAddress.unionAddress))

		await transfer(creatorSdk, { itemId: nft.id },
			suite.transferRequest(recipientWalletAddress.unionAddress))

		await awaitForOwnershipValue(recipientSdk, nft.id, recipientWalletAddress.address,
			toBigNumber(suite.recipientBalanceAfterTransfer))

		await getActivitiesByItem(creatorSdk, nft.id,
			[ActivityType.MINT, ActivityType.TRANSFER],
			[ActivityType.MINT, ActivityType.TRANSFER])

		await burn(recipientSdk, { itemId: nft.id }, suite.burnRequest, suite.totalBalanceAfterBurn)

		await getActivitiesByItem(creatorSdk, nft.id,
			[ActivityType.MINT, ActivityType.TRANSFER, ActivityType.BURN],
			[ActivityType.MINT, ActivityType.TRANSFER, ActivityType.BURN])

	})
})
