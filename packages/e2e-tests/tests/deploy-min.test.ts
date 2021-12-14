import { Blockchain } from "@rarible/api-client"
import type { UnionAddress } from "@rarible/types"
import { toUnionAddress } from "@rarible/types"
import type { DeployTokenRequest } from "@rarible/sdk/src/types/nft/deploy/domain"
import { MintType } from "@rarible/sdk/src/types/nft/mint/domain"
import type { MintRequest } from "@rarible/sdk/build/types/nft/mint/mint-request.type"
import type { DeployTezosTokenRequest } from "@rarible/sdk/build/types/nft/deploy/domain"
import { retry } from "@rarible/sdk/src/common/retry"
import { getWalletAddress } from "./common/wallet"
import { createSdk } from "./common/create-sdk"

const suites: {
	blockchain: Blockchain,
	deployRequest: (address: UnionAddress) => DeployTokenRequest
	mintRequest: (address: UnionAddress) => MintRequest
}[] = [
	{
		blockchain: Blockchain.ETHEREUM,
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
			const { sdk, wallet } = createSdk(suite.blockchain)

			test("should deploy and mint nft", async () => {
				const walletAddress = toUnionAddress(await getWalletAddress(wallet))
				const { tx, address } = await sdk.nft.deploy(suite.deployRequest(walletAddress))
				await tx.wait()

				expect(address).toBeTruthy()
				expect(typeof address).toBe("string")

				const collection = await retry(10, 1000, async () => {
					return await sdk.apis.collection.getCollectionById({
						collection: address,
					})
				})

				expect(collection).not.toBe(null)

				const mintPrepare = await sdk.nft.mint({ collection })

				const mintResult = await mintPrepare.submit(suite.mintRequest(walletAddress))

				if (mintResult.type === MintType.ON_CHAIN) {
					const transaction = await mintResult.transaction.wait()
					expect(transaction.blockchain).toEqual(suite.blockchain)
					expect(transaction.hash).toBeTruthy()
				} else {
					throw new Error("Must be on chain")
				}
			})
		})
	}
})
