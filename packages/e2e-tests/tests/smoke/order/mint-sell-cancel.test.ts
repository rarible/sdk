import { ActivityType, Blockchain } from "@rarible/api-client"
import type { UnionAddress } from "@rarible/types"
import type { MintRequest } from "@rarible/sdk/build/types/nft/mint/mint-request.type"
import type { BlockchainWallet } from "@rarible/sdk-wallet"
import type { RequestCurrency } from "@rarible/sdk/src/common/domain"
import type { OrderRequest } from "@rarible/sdk/src/types/order/common"
import { toBigNumber } from "@rarible/types"
import { sell } from "../../common/atoms-tests/sell"
import {
	getEthereumWallet,
	getEthereumWalletBuyer,
	getSolanaWallet,
	getTezosTestWallet,
	getWalletAddressFull,
} from "../../common/wallet"
import { createSdk } from "../../common/create-sdk"
import { mint } from "../../common/atoms-tests/mint"
import { getCollection } from "../../common/helpers"
import { cancel } from "../../common/atoms-tests/cancel"
import { testsConfig } from "../../common/config"
import { getCurrency } from "../../common/currency"
import { getActivitiesByItem } from "../../common/api-helpers/activity-helper"

function suites(): {
	blockchain: Blockchain,
	description: string,
	wallets: { seller: BlockchainWallet, buyer: BlockchainWallet },
	collectionId: string,
	mintRequest: (address: UnionAddress) => MintRequest,
	currency: string,
	sellRequest: (currency: RequestCurrency) => Promise<OrderRequest>
}[] {
	let allBlockchains = [
		{
			blockchain: Blockchain.ETHEREUM,
			description: "ERC721 <=> ETH",
			wallets: { seller: getEthereumWallet(), buyer: getEthereumWalletBuyer() },
			collectionId: testsConfig.variables.ETHEREUM_COLLECTION_ERC_721,
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
			currency: "ETH",
			sellRequest: async (currency: RequestCurrency): Promise<OrderRequest> => {
				return {
					amount: 1,
					price: "0.0000000000000001",
					currency: currency,
				}
			},
		},
		{
			blockchain: Blockchain.ETHEREUM,
			description: "ERC721 <=> ERC20",
			wallets: { seller: getEthereumWallet(), buyer: getEthereumWalletBuyer() },
			collectionId: testsConfig.variables.ETHEREUM_COLLECTION_ERC_721,
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
			currency: "ERC20",
			sellRequest: async (currency: RequestCurrency): Promise<OrderRequest> => {
				return {
					amount: 1,
					price: "0.0000000000000001",
					currency: currency,
				}
			},
		},
		{
			blockchain: Blockchain.ETHEREUM,
			description: "ERC721_lazy <=> ETH",
			wallets: { seller: getEthereumWallet(), buyer: getEthereumWalletBuyer() },
			collectionId: testsConfig.variables.ETHEREUM_COLLECTION_ERC_721,
			mintRequest: (walletAddress: UnionAddress): MintRequest => {
				return {
					uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
					creators: [{
						account: walletAddress,
						value: 10000,
					}],
					royalties: [],
					lazyMint: true,
					supply: 1,
				}
			},
			currency: "ETH",
			sellRequest: async (currency: RequestCurrency): Promise<OrderRequest> => {
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
			mintRequest: (walletAddress: UnionAddress): MintRequest => {
				return {
					uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
					creators: [{
						account: walletAddress,
						value: 10000,
					}],
					royalties: [],
					lazyMint: true,
					supply: 1,
				}
			},
			currency: "ERC20",
			sellRequest: async (currency: RequestCurrency): Promise<OrderRequest> => {
				return {
					amount: 1,
					price: "0.0000000000000001",
					currency: currency,
				}
			},
		},
		{
			blockchain: Blockchain.ETHEREUM,
			description: "ERC1155 <=> ETH",
			wallets: { seller: getEthereumWallet(), buyer: getEthereumWalletBuyer() },
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
			currency: "ETH",
			sellRequest: async (currency: RequestCurrency): Promise<OrderRequest> => {
				return {
					amount: 20,
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
			currency: "ERC20",
			sellRequest: async (currency: RequestCurrency): Promise<OrderRequest> => {
				return {
					amount: 20,
					price: "0.0000000000000001",
					currency: currency,
				}
			},
		},
		{
			blockchain: Blockchain.ETHEREUM,
			description: "ERC1155_lazy <=> ETH",
			wallets: { seller: getEthereumWallet(), buyer: getEthereumWalletBuyer() },
			collectionId: testsConfig.variables.ETHEREUM_COLLECTION_ERC_1155,
			mintRequest: (walletAddress: UnionAddress): MintRequest => {
				return {
					uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
					creators: [{
						account: walletAddress,
						value: 10000,
					}],
					royalties: [],
					lazyMint: true,
					supply: 20,
				}
			},
			currency: "ETH",
			sellRequest: async (currency: RequestCurrency): Promise<OrderRequest> => {
				return {
					amount: 20,
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
			mintRequest: (walletAddress: UnionAddress): MintRequest => {
				return {
					uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
					creators: [{
						account: walletAddress,
						value: 10000,
					}],
					royalties: [],
					lazyMint: true,
					supply: 20,
				}
			},
			currency: "ERC20",
			sellRequest: async (currency: RequestCurrency): Promise<OrderRequest> => {
				return {
					amount: 20,
					price: "0.0000000000000001",
					currency: currency,
				}
			},
		},
		{
			blockchain: Blockchain.TEZOS,
			description: "NFT <=> XTZ",
			wallets: { seller: getTezosTestWallet(0), buyer: getTezosTestWallet(1) },
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
			wallets: { seller: getTezosTestWallet(0), buyer: getTezosTestWallet(1) },
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

		/*{
      blockchain: Blockchain.FLOW,
      wallets: { seller: getFlowWallet(), buyer: getFlowWallet() },
      collectionId: "FLOW:A.ebf4ae01d1284af8.RaribleNFT",
      mintRequest: (walletAddress: UnionAddress) => {
        return {
          uri: "ipfs://ipfs/QmNe7Hd9xiqm1MXPtQQjVtksvWX6ieq9Wr6kgtqFo9D4CU",
          supply: 1,
          lazyMint: false,
        }
      },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      getCurrency: async (wallet: BlockchainWallet): Promise<RequestCurrency> => {
        if (wallet.blockchain === "FLOW") {
          return {
            "@type": "FLOW_FT",
            contract: toContractAddress("FLOW:A.7e60df042a9c0868.FlowToken"),
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
	return allBlockchains.filter(b => testsConfig.blockchain?.includes(b.blockchain))
}

describe.each(suites())("$blockchain mint => sell => cancel", (suite) => {
	const { seller: sellerWallet } = suite.wallets
	const sellerSdk = createSdk(suite.blockchain, sellerWallet)

	test(suite.description, async () => {
		const sellerWalletAddress = await getWalletAddressFull(sellerWallet)

		// Get collection
		const collection = await getCollection(sellerSdk, suite.collectionId)

		// Mint token
		const { nft } = await mint(sellerSdk, sellerWallet, { collection },
			suite.mintRequest(sellerWalletAddress.unionAddress))

		// Get currency
		const requestCurrency = await getCurrency(suite.wallets, suite.currency)
		const orderRequest = await suite.sellRequest(requestCurrency)

		// Create sell order
		const sellOrder = await sell(sellerSdk, sellerWallet, { itemId: nft.id }, orderRequest)

		await getActivitiesByItem(sellerSdk, nft.id,
			[ActivityType.MINT, ActivityType.LIST],
			[ActivityType.LIST, ActivityType.MINT])

		// Cancel order
		await cancel(sellerSdk, sellerWallet, { orderId: sellOrder.id })

		await getActivitiesByItem(sellerSdk, nft.id,
			[ActivityType.MINT, ActivityType.LIST, ActivityType.CANCEL_LIST],
			[ActivityType.LIST, ActivityType.MINT, ActivityType.CANCEL_LIST])
	})
})
