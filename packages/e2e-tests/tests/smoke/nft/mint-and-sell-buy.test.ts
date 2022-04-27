import { ActivityType, Blockchain } from "@rarible/api-client"
import type { UnionAddress } from "@rarible/types"
import { toBigNumber } from "@rarible/types"
import type { BlockchainWallet } from "@rarible/sdk-wallet"
import type { MintAndSellRequest } from "@rarible/sdk"
import { getEthereumWallet, getSolanaWallet, getTezosTestWallet, getWalletAddressFull } from "../../common/wallet"
import { createSdk } from "../../common/create-sdk"
import { testsConfig } from "../../common/config"
import { awaitForOwnershipValue } from "../../common/api-helpers/ownership-helper"
import { getCollection } from "../../common/helpers"
import { mintAndSell } from "../../common/atoms-tests/mint-and-sell"
import { buy } from "../../common/atoms-tests/buy"
import { getActivitiesByItem } from "../../common/api-helpers/activity-helper"

function suites(): {
	blockchain: Blockchain,
	description: string,
	wallets: { creator: BlockchainWallet, buyer: BlockchainWallet },
	collectionId: string,
	mintAndSellRequest: (address: UnionAddress) => MintAndSellRequest,
	buyAmount: number,
	creatorBalance: number,
	mintSellActivities: Array<ActivityType>
}[] {
	let allBlockchains = [
		{
			blockchain: Blockchain.ETHEREUM,
			description: "ERC721 <=> ETH",
			wallets: { creator: getEthereumWallet(), buyer: getEthereumWallet(testsConfig.variables.ETHEREUM_WALLET_BUYER) },
			collectionId: testsConfig.variables.ETHEREUM_COLLECTION_ERC_721,
			mintAndSellRequest: (walletAddress: UnionAddress): MintAndSellRequest => {
				return {
					uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
					creators: [{
						account: walletAddress,
						value: 10000,
					}],
					royalties: [],
					lazyMint: false,
					supply: 1,
					price: "0.000000000000000001",
					currency: {
						"@type": "ETH",
					},
				}
			},
			buyAmount: 1,
			creatorBalance: 0,
			mintSellActivities: [ActivityType.MINT, ActivityType.LIST],
		},
		{
			blockchain: Blockchain.ETHEREUM,
			description: "ERC721_lazy <=> ETH",
			wallets: { creator: getEthereumWallet(), buyer: getEthereumWallet(testsConfig.variables.ETHEREUM_WALLET_BUYER) },
			collectionId: testsConfig.variables.ETHEREUM_COLLECTION_ERC_721,
			mintAndSellRequest: (walletAddress: UnionAddress): MintAndSellRequest => {
				return {
					uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
					creators: [{
						account: walletAddress,
						value: 10000,
					}],
					royalties: [],
					lazyMint: true,
					supply: 1,
					price: "0.000000000000000001",
					currency: {
						"@type": "ETH",
					},
				}
			},
			buyAmount: 1,
			creatorBalance: 0,
			mintSellActivities: [ActivityType.LIST],
		},
		{
			blockchain: Blockchain.ETHEREUM,
			description: "ERC1155 <=> ETH",
			wallets: { creator: getEthereumWallet(), buyer: getEthereumWallet(testsConfig.variables.ETHEREUM_WALLET_BUYER) },
			collectionId: testsConfig.variables.ETHEREUM_COLLECTION_ERC_1155,
			mintAndSellRequest: (walletAddress: UnionAddress): MintAndSellRequest => {
				return {
					uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
					creators: [{
						account: walletAddress,
						value: 10000,
					}],
					royalties: [],
					lazyMint: false,
					supply: 20,
					price: "0.000000000000000001",
					currency: {
						"@type": "ETH",
					},
				}
			},
			buyAmount: 11,
			creatorBalance: 9,
			mintSellActivities: [ActivityType.MINT, ActivityType.LIST],
		},
		{
			blockchain: Blockchain.ETHEREUM,
			description: "ERC1155_lazy <=> ETH",
			wallets: { creator: getEthereumWallet(), buyer: getEthereumWallet(testsConfig.variables.ETHEREUM_WALLET_BUYER) },
			collectionId: testsConfig.variables.ETHEREUM_COLLECTION_ERC_1155,
			mintAndSellRequest: (walletAddress: UnionAddress): MintAndSellRequest => {
				return {
					uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
					creators: [{
						account: walletAddress,
						value: 10000,
					}],
					royalties: [],
					lazyMint: true,
					supply: 20,
					price: "0.000000000000000001",
					currency: {
						"@type": "ETH",
					},
				}
			},
			buyAmount: 11,
			creatorBalance: 9,
			mintSellActivities: [ActivityType.LIST],
		},
		{
			blockchain: Blockchain.TEZOS,
			description: "NFT <=> XTZ",
			wallets: { creator: getTezosTestWallet(0), buyer: getTezosTestWallet(1) },
			collectionId: testsConfig.variables.TEZOS_COLLECTION_ID_NFT,
			mintAndSellRequest: (walletAddress: UnionAddress): MintAndSellRequest => {
				return {
					uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
					creators: [{
						account: walletAddress,
						value: 10000,
					}],
					royalties: [],
					lazyMint: false,
					supply: 1,
					price: "0.02",
					currency: {
						"@type": "XTZ",
					},
				}
			},
			buyAmount: 1,
			creatorBalance: 0,
			mintSellActivities: [ActivityType.MINT, ActivityType.LIST],
		},
		{
			blockchain: Blockchain.TEZOS,
			description: "MT <=> XTZ",
			wallets: { creator: getTezosTestWallet(0), buyer: getTezosTestWallet(1) },
			collectionId: testsConfig.variables.TEZOS_COLLECTION_ID_MT,
			mintAndSellRequest: (walletAddress: UnionAddress): MintAndSellRequest => {
				return {
					uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
					creators: [{
						account: walletAddress,
						value: 10000,
					}],
					royalties: [],
					lazyMint: false,
					supply: 12,
					price: "0.02",
					currency: {
						"@type": "XTZ",
					},
				}
			},
			buyAmount: 5,
			creatorBalance: 0,
			mintSellActivities: [ActivityType.MINT, ActivityType.LIST],
		},
		{
			blockchain: Blockchain.SOLANA,
			description: "NFT <=> SOLANA_SOL",
			wallets: { creator: getSolanaWallet(0), buyer: getSolanaWallet(1) },
			collectionId: testsConfig.variables.SOLANA_COLLECTION,
			mintAndSellRequest: (walletAddress: UnionAddress): MintAndSellRequest => {
				return {
					uri: testsConfig.variables.SOLANA_URI,
					creators: [{
						account: walletAddress,
						value: 10000,
					}],
					royalties: [],
					lazyMint: false,
					supply: 1,
					price: "0.001",
					currency: {
						"@type": "SOLANA_SOL",
					},
				}
			},
			buyAmount: 1,
			creatorBalance: 0,
			mintSellActivities: [ActivityType.MINT, ActivityType.LIST],
		},
	]
	return allBlockchains.filter(b => testsConfig.blockchain?.includes(b.blockchain))
}

describe.each(suites())("$blockchain mint-and-sell => buy", (suite) => {
	const { creator: creatorWallet, buyer: buyerWallet } = suite.wallets
	const creatorSdk = createSdk(suite.blockchain, creatorWallet)
	const buyerSdk = createSdk(suite.blockchain, buyerWallet)

	test(suite.description, async () => {
		const walletAddressCreator = await getWalletAddressFull(creatorWallet)
		const walletAddressBuyer = await getWalletAddressFull(buyerWallet)

		// Get collection
		const collection = await getCollection(creatorSdk, suite.collectionId)

		// Mint and sell token
		const mintAndSellResponse = await mintAndSell(creatorSdk, creatorWallet, { collection },
			suite.mintAndSellRequest(walletAddressCreator.unionAddress))

		await getActivitiesByItem(creatorSdk, mintAndSellResponse.itemId,
			[ActivityType.MINT, ActivityType.LIST], suite.mintSellActivities)

		await buy(buyerSdk, buyerWallet, mintAndSellResponse.itemId,
			{ orderId: mintAndSellResponse.orderId }, { amount: suite.buyAmount })

		// Verify buyer balance
		await awaitForOwnershipValue(buyerSdk, mintAndSellResponse.itemId,
			walletAddressBuyer.address, toBigNumber(String(suite.buyAmount)))

		await getActivitiesByItem(creatorSdk, mintAndSellResponse.itemId,
			[ActivityType.SELL, ActivityType.TRANSFER, ActivityType.MINT, ActivityType.LIST],
			[ActivityType.TRANSFER, ActivityType.SELL, ActivityType.LIST, ActivityType.MINT])
	})
})
