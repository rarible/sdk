import { Blockchain } from "@rarible/api-client"
import type { UnionAddress } from "@rarible/types"
import { toUnionAddress } from "@rarible/types"
import type { DeployTokenRequest } from "@rarible/sdk/src/types/nft/deploy/domain"
import type { MintRequest } from "@rarible/sdk/build/types/nft/mint/mint-request.type"
import type { DeployTezosTokenRequest } from "@rarible/sdk/build/types/nft/deploy/domain"
import type { BlockchainWallet } from "@rarible/sdk-wallet"
import { getEthereumWallet, getTezosWallet, getWalletAddress } from "./common/wallet"
import { createSdk } from "./common/create-sdk"
import { mint } from "./common/atoms-tests/mint"
import { getCollection } from "./common/helpers"

const suites: {
	blockchain: Blockchain,
	wallet: BlockchainWallet,
	deployRequest: (address: UnionAddress) => DeployTokenRequest
	mintRequest: (address: UnionAddress) => MintRequest
}[] = [
	{
		blockchain: Blockchain.ETHEREUM,
		wallet: getEthereumWallet(),
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		deployRequest: (walletAddress: UnionAddress) => {
			return {
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
			}
		},
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
		wallet: getTezosWallet(),
		deployRequest: (walletAddress: UnionAddress): DeployTezosTokenRequest => {
			return {
				blockchain: Blockchain.TEZOS,
				asset: {
					assetType: "NFT",
					arguments: {
						owner: walletAddress,
						isPublicCollection: false,
					},
				},
			}
		},
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
]


describe("deploy-mint", () => {
	for (const suite of suites) {
		describe(suite.blockchain, () => {
			const wallet = suite.wallet
			const sdk = createSdk(suite.blockchain, wallet)

			test("should deploy and mint nft", async () => {
				const walletAddress = toUnionAddress(await getWalletAddress(wallet))
				const { tx, address } = await sdk.nft.deploy(suite.deployRequest(walletAddress))
				await tx.wait()

				expect(address).toBeTruthy()
				expect(typeof address).toBe("string")

				const collection = await getCollection(sdk, address)
				await mint(sdk, wallet, { collection }, suite.mintRequest(walletAddress))
			})
		})
	}
})
