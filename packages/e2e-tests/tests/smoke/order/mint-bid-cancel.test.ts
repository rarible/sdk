import { ActivityType, Blockchain } from "@rarible/api-client"
import type { UnionAddress } from "@rarible/types"
import type { MintRequest } from "@rarible/sdk/build/types/nft/mint/mint-request.type"
import type { BlockchainWallet } from "@rarible/sdk-wallet"
import type { RequestCurrency } from "@rarible/sdk/src/common/domain"
import type { OrderRequest } from "@rarible/sdk/src/types/order/common"
import { toBigNumber } from "@rarible/types"
import {
	getEthereumWallet,
	getEthereumWalletBuyer, getSolanaWallet,
	getWalletAddressFull,
} from "../../common/wallet"
import { createSdk } from "../../common/create-sdk"
import { mint } from "../../common/atoms-tests/mint"
import { getCollection } from "../../common/helpers"
import { bid } from "../../common/atoms-tests/bid"
import { testsConfig } from "../../common/config"
import { getCurrency } from "../../common/currency"
import { cancel } from "../../common/atoms-tests/cancel"
import { getActivitiesByItem } from "../../common/api-helpers/activity-helper"

function suites(): {
	blockchain: Blockchain,
	description: string,
	wallets: { seller: BlockchainWallet, buyer: BlockchainWallet },
	collectionId: string,
	mintRequest: (creatorAddress: UnionAddress) => MintRequest,
	currency: string,
	bidRequest: (currency: RequestCurrency) => Promise<OrderRequest>
}[] {
	let allBlockchains = [
		{
			blockchain: Blockchain.ETHEREUM,
			description: "ERC721 <=> ERC20",
			wallets: { seller: getEthereumWallet(), buyer: getEthereumWalletBuyer() },
			collectionId: testsConfig.variables.ETHEREUM_COLLECTION_ERC_721,
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
			currency: "ERC20",
			bidRequest: async (currency: RequestCurrency): Promise<OrderRequest> => {
				return {
					amount: 1,
					price: "0.0000000000000001",
					currency: currency,
				}
			},
		},
		{
			blockchain: Blockchain.ETHEREUM,
			description: "ERC721_lazy <=> ERC20",
			wallets: { seller: getEthereumWallet(), buyer: getEthereumWalletBuyer() },
			collectionId: testsConfig.variables.ETHEREUM_COLLECTION_ERC_721,
			mintRequest: (creatorAddress: UnionAddress): MintRequest => {
				return {
					uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
					creators: [{
						account: creatorAddress,
						value: 10000,
					}],
					royalties: [],
					lazyMint: true,
					supply: 1,
				}
			},
			currency: "ERC20",
			bidRequest: async (currency: RequestCurrency): Promise<OrderRequest> => {
				return {
					amount: 1,
					price: "0.0000000000000001",
					currency: currency,
				}
			},
		},
		{
			blockchain: Blockchain.ETHEREUM,
			description: "ERC1155 <=> ERC20",
			wallets: { seller: getEthereumWallet(), buyer: getEthereumWalletBuyer() },
			collectionId: testsConfig.variables.ETHEREUM_COLLECTION_ERC_1155,
			mintRequest: (creatorAddress: UnionAddress): MintRequest => {
				return {
					uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
					creators: [{
						account: creatorAddress,
						value: 10000,
					}],
					royalties: [],
					lazyMint: false,
					supply: 20,
				}
			},
			currency: "ERC20",
			bidRequest: async (currency: RequestCurrency): Promise<OrderRequest> => {
				return {
					amount: 5,
					price: "0.0000000000000001",
					currency: currency,
				}
			},
		},
		{
			blockchain: Blockchain.ETHEREUM,
			description: "ERC1155_lazy <=> ERC20",
			wallets: { seller: getEthereumWallet(), buyer: getEthereumWalletBuyer() },
			collectionId: testsConfig.variables.ETHEREUM_COLLECTION_ERC_1155,
			mintRequest: (creatorAddress: UnionAddress): MintRequest => {
				return {
					uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
					creators: [{
						account: creatorAddress,
						value: 10000,
					}],
					royalties: [],
					lazyMint: true,
					supply: 20,
				}
			},
			currency: "ERC20",
			bidRequest: async (currency: RequestCurrency): Promise<OrderRequest> => {
				return {
					amount: 5,
					price: "0.0000000000000001",
					currency: currency,
				}
			},
		},
		/*{
      blockchain: Blockchain.TEZOS,
      wallets: { seller: getTezosWallet(2), buyer: getTezosWallet(1) },
      collectionId: "TEZOS:KT1DK9ArYc2QVgqr4jz46WnWt5g9zsE3Cifb",
      mintRequest: (creatorAddress: UnionAddress): MintRequest => {
        return {
          uri: "ipfs://bafkreiaz7n5zj2qvtwmqnahz7rwt5h37ywqu7znruiyhwuav3rbbxzert4",
          creators: [{
            account: creatorAddress,
            value: 10000,
          }],
          royalties: [],
          lazyMint: false,
          supply: 1,
        }
      },
      bidRequest: async (currency: RequestCurrency, payoutAddress: UnionAddress): Promise<OrderRequest> => {
        return {
          amount: 1,
          price: "0.000001",
          currency: currency,
          payouts: [{
            account: payoutAddress,
            value: 10000,
          }],
        }
      },
      getCurrency: async (wallets: { seller: BlockchainWallet, buyer: BlockchainWallet }): Promise<RequestCurrency> => {
        if (wallets.seller.blockchain === "TEZOS" && wallets.buyer.blockchain === "TEZOS") {
          return {
            "@type": "XTZ",
          }
        }
        throw new Error("Wrong blockchain")
      },
    },*/
		{
			blockchain: Blockchain.SOLANA,
			description: "NFT <=> SOLANA_SOL",
			wallets: { seller: getSolanaWallet(0), buyer: getSolanaWallet(1) },
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
					price: toBigNumber("0.001"),
					currency: currency,
				}
			},
		},
	]
	return allBlockchains.filter(b => testsConfig.blockchain?.includes(b.blockchain))
}

describe.each(suites())("$blockchain mint => bid => cancel", (suite) => {
	const { seller: sellerWallet, buyer: buyerWallet } = suite.wallets
	const sellerSdk = createSdk(suite.blockchain, sellerWallet)
	const buyerSdk = createSdk(suite.blockchain, buyerWallet)

	test(suite.description, async () => {
		const walletAddressSeller = await getWalletAddressFull(sellerWallet)

		// Get collection
		const collection = await getCollection(sellerSdk, suite.collectionId)

		// Mint token
		const { nft } = await mint(sellerSdk, sellerWallet, { collection },
			suite.mintRequest(walletAddressSeller.unionAddress))

		// Get currency
		const requestCurrency = await getCurrency(suite.wallets, suite.currency)
		const bidRequest = await suite.bidRequest(requestCurrency)

		// Create bid order
		const bidOrder = await bid(buyerSdk, buyerWallet, { itemId: nft.id }, bidRequest)

		await getActivitiesByItem(buyerSdk, nft.id,
			[ActivityType.MINT, ActivityType.BID],
			[ActivityType.MINT, ActivityType.BID])

		// Cancel order
		await cancel(buyerSdk, buyerWallet, { orderId: bidOrder.id })

		await getActivitiesByItem(buyerSdk, nft.id,
			[ActivityType.MINT, ActivityType.BID, ActivityType.CANCEL_BID],
			[ActivityType.MINT, ActivityType.BID, ActivityType.CANCEL_BID])
	})
})
