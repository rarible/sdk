import { ActivityType, Blockchain } from "@rarible/api-client"
import type { UnionAddress } from "@rarible/types"
import type { CreateCollectionRequest } from "@rarible/sdk/src/types/nft/deploy/domain"
import type { MintRequest } from "@rarible/sdk/build/types/nft/mint/mint-request.type"
import type { BlockchainWallet } from "@rarible/sdk-wallet"
import { getSolanaWallet, getWalletAddressFull } from "../../../common/wallet"
import { createSdk } from "../../../common/create-sdk"
import { mint } from "../../../common/atoms-tests/mint"
import { getCollection } from "../../../common/helpers"
import { createCollection } from "../../../common/atoms-tests/create-collection"
import { getActivitiesByItem } from "../../../common/api-helpers/activity-helper"

function suites(): {
	blockchain: Blockchain,
	description: string,
	wallet: BlockchainWallet,
	deployRequest: CreateCollectionRequest,
	mintRequest: (address: UnionAddress) => MintRequest,
	activities: Array<ActivityType>
}[] {
	return [
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
}

describe.each(suites())("$blockchain deploy => mint", (suite) => {
	const wallet = suite.wallet
	const sdk = createSdk(suite.blockchain, wallet)

	test(suite.description, async () => {
		const walletAddress = await getWalletAddressFull(wallet)
		const { address } = await createCollection(sdk, wallet, suite.deployRequest)

		const collection = await getCollection(sdk, address)

		const { nft } = await mint(sdk, wallet, { collection },
			suite.mintRequest(walletAddress.unionAddress))

		await getActivitiesByItem(sdk, nft.id, [ActivityType.MINT], suite.activities)

	})
})
