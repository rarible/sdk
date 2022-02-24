import { Blockchain } from "@rarible/api-client"
import type { UnionAddress } from "@rarible/types"
import type { DeployTokenRequest } from "@rarible/sdk/src/types/nft/deploy/domain"
import type { MintRequest } from "@rarible/sdk/build/types/nft/mint/mint-request.type"
import type { BlockchainWallet } from "@rarible/sdk-wallet"
import { getEthereumWallet, getTezosTestWallet, getWalletAddressNew } from "../../common/wallet"
import { createSdk } from "../../common/create-sdk"
import { mint } from "../../common/atoms-tests/mint"
import { getCollection } from "../../common/helpers"
import { deployCollection } from "../../common/atoms-tests/deploy-collection"
import { testsConfig } from "../../common/config";

function suites(): {
	blockchain: Blockchain,
	description: string,
	wallet: BlockchainWallet,
	deployRequest: DeployTokenRequest
	mintRequest: (address: UnionAddress) => MintRequest
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
			} as DeployTokenRequest,
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
						isUserToken: true,
						operators: []
					},
				},
			} as DeployTokenRequest,
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
			} as DeployTokenRequest,
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
						operators: []
					},
				},
			} as DeployTokenRequest,
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
			} as DeployTokenRequest,
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
		},
		{
			blockchain: Blockchain.TEZOS,
			description: "NFT_lazy",
			wallet: getTezosTestWallet(),
			deployRequest: {
				blockchain: Blockchain.TEZOS,
				asset: {
					assetType: "NFT",
					arguments: {
						name: "NFT",
						symbol: "AUTO_NFT",
						contractURI: "https://ipfs.io/ipfs/QmTKxwnqqxTxH4HE3UVM9yoJFZgbsZ8CuqqRFZCSWBF53m",
						isUserToken: true,
						operators: []
					},
				},
			} as DeployTokenRequest,
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
						operators: []
					},
				},
			} as DeployTokenRequest,
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
		},
		{
			blockchain: Blockchain.TEZOS,
			description: "MT_lazy",
			wallet: getTezosTestWallet(),
			deployRequest: {
				blockchain: Blockchain.TEZOS,
				asset: {
					assetType: "MT",
					arguments: {
						name: "MT",
						symbol: "AUTO_MT",
						contractURI: "https://ipfs.io/ipfs/QmTKxwnqqxTxH4HE3UVM9yoJFZgbsZ8CuqqRFZCSWBF53m",
						isUserToken: true,
						operators: []
					},
				},
			} as DeployTokenRequest,
			mintRequest: (walletAddress: UnionAddress) => {
				return {
					uri: "ipfs:/test",
					creators: [{
						account: walletAddress,
						value: 10000,
					}],
					royalties: [],
					lazyMint: true,
					supply: 15,
				}
			},
		},
	]
	return allBlockchains.filter(b => testsConfig.blockchain?.includes(b.blockchain))
}

describe.each(suites())("$blockchain deploy => mint", (suite) => {
	const wallet = suite.wallet
	const sdk = createSdk(suite.blockchain, wallet)

	test(suite.description, async () => {
		const walletAddress = await getWalletAddressNew(wallet)
		// Deploy new collection
		const { address } = await deployCollection(sdk, wallet, suite.deployRequest)

		// Get collection
		const collection = await getCollection(sdk, address)

		// Mint token
		await mint(sdk, wallet, { collection }, suite.mintRequest(walletAddress.unionAddress))
	})
})
