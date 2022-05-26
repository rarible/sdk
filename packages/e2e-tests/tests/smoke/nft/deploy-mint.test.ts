import { ActivityType, Blockchain } from "@rarible/api-client"
import type { UnionAddress } from "@rarible/types"
import type { CreateCollectionRequest } from "@rarible/sdk/src/types/nft/deploy/domain"
import type { MintRequest } from "@rarible/sdk/build/types/nft/mint/mint-request.type"
import type { BlockchainWallet } from "@rarible/sdk-wallet"
import { getEthereumWallet, getSolanaWallet, getTezosTestWallet, getWalletAddressFull } from "../../common/wallet"
import { createSdk } from "../../common/create-sdk"
import { mint } from "../../common/atoms-tests/mint"
import { getCollection } from "../../common/helpers"
import { createCollection } from "../../common/atoms-tests/create-collection"
import { testsConfig } from "../../common/config"
import { getActivitiesByItem } from "../../common/api-helpers/activity-helper"

function suites(): {
	blockchain: Blockchain,
	description: string,
	wallet: BlockchainWallet,
	deployRequest: CreateCollectionRequest,
	mintRequest: (address: UnionAddress) => MintRequest,
	activities: Array<ActivityType>
}[] {
	let allBlockchains = [
		{
			blockchain: Blockchain.ETHEREUM,
			description: "ERC721",
			wallet: getEthereumWallet(),
			deployRequest: {
				blockchain: Blockchain.ETHEREUM,
				asset: {
					assetType: "ERC721",
					arguments: {
						name: "name",
						symbol: "RARI",
						baseURI: "https://ipfs.rarible.com",
						contractURI: "https://ipfs.rarible.com",
						isUserToken: false,
					},
				},
			} as CreateCollectionRequest,
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
			blockchain: Blockchain.ETHEREUM,
			description: "ERC721_lazy",
			wallet: getEthereumWallet(),
			deployRequest: {
				blockchain: Blockchain.ETHEREUM,
				asset: {
					assetType: "ERC721",
					arguments: {
						name: "name",
						symbol: "RARI",
						baseURI: "https://ipfs.rarible.com",
						contractURI: "https://ipfs.rarible.com",
						isUserToken: false,
						operators: [],
					},
				},
			} as CreateCollectionRequest,
			mintRequest: (walletAddress: UnionAddress) => {
				return {
					uri: "ipfs:/test",
					creators: [{
						account: walletAddress,
						value: 10000,
					}],
					royalties: [],
					lazyMint: true,
					supply: 1,
				}
			},
			activities: [],
		},
		{
			blockchain: Blockchain.ETHEREUM,
			description: "ERC1155",
			wallet: getEthereumWallet(),
			deployRequest: {
				blockchain: Blockchain.ETHEREUM,
				asset: {
					assetType: "ERC1155",
					arguments: {
						name: "name",
						symbol: "RARI",
						baseURI: "https://ipfs.rarible.com",
						contractURI: "https://ipfs.rarible.com",
						isUserToken: false,
					},
				},
			} as CreateCollectionRequest,
			mintRequest: (walletAddress: UnionAddress) => {
				return {
					uri: "ipfs:/test",
					creators: [{
						account: walletAddress,
						value: 10000,
					}],
					royalties: [],
					lazyMint: false,
					supply: 14,
				}
			},
			activities: [ActivityType.MINT],
		},
		{
			blockchain: Blockchain.ETHEREUM,
			description: "ERC1155_lazy",
			wallet: getEthereumWallet(),
			deployRequest: {
				blockchain: Blockchain.ETHEREUM,
				asset: {
					assetType: "ERC1155",
					arguments: {
						name: "name",
						symbol: "RARI",
						baseURI: "https://ipfs.rarible.com",
						contractURI: "https://ipfs.rarible.com",
						isUserToken: true,
						operators: [],
					},
				},
			} as CreateCollectionRequest,
			mintRequest: (walletAddress: UnionAddress) => {
				return {
					uri: "ipfs:/test",
					creators: [{
						account: walletAddress,
						value: 10000,
					}],
					royalties: [],
					lazyMint: true,
					supply: 14,
				}
			},
			activities: [],
		},
		{
			blockchain: Blockchain.TEZOS,
			description: "NFT",
			wallet: getTezosTestWallet(),
			deployRequest: {
				blockchain: Blockchain.TEZOS,
				asset: {
					assetType: "NFT",
					arguments: {
						name: "NFT",
						symbol: "AUTO_NFT",
						contractURI: "https://ipfs.io/ipfs/QmTKxwnqqxTxH4HE3UVM9yoJFZgbsZ8CuqqRFZCSWBF53m",
						isUserToken: false,
					},
				},
			} as CreateCollectionRequest,
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
				asset: {
					assetType: "MT",
					arguments: {
						name: "MT",
						symbol: "AUTO_MT",
						contractURI: "https://ipfs.io/ipfs/QmTKxwnqqxTxH4HE3UVM9yoJFZgbsZ8CuqqRFZCSWBF53m",
						isUserToken: false,
						operators: [],
					},
				},
			} as CreateCollectionRequest,
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
		{
			blockchain: Blockchain.SOLANA,
			description: "NFT",
			wallet: getSolanaWallet(),
			deployRequest: {
				blockchain: Blockchain.SOLANA,
				asset: {
					arguments: {
						metadataURI: "https://gist.githubusercontent.com/rzcoder/757f644f9755acb00aa8c34b619eb2a8/raw/ab18b90681643279c63ed96a666c622700bf30aa/konosuba",
					},
				},
			} as CreateCollectionRequest,
			mintRequest: (walletAddress: UnionAddress) => {
				return {
					uri: "https://arweave.net/Vt0uj2ql0ck-U5dLWDWJnwQaZPrvqkfxils8agrTiOc",
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
	]
	return allBlockchains.filter(b => testsConfig.blockchain?.includes(b.blockchain))
}

describe.each(suites())("$blockchain deploy => mint", (suite) => {
	const wallet = suite.wallet
	const sdk = createSdk(suite.blockchain, wallet)

	test(suite.description, async () => {
		const walletAddress = await getWalletAddressFull(wallet)
		// Deploy new collection
		const { address } = await createCollection(sdk, wallet, suite.deployRequest)

		// Get collection
		const collection = await getCollection(sdk, address)

		// Mint token
		const { nft } = await mint(sdk, wallet, { collection },
			suite.mintRequest(walletAddress.unionAddress))

		await getActivitiesByItem(sdk, nft.id, [ActivityType.MINT], suite.activities)

	})
})
