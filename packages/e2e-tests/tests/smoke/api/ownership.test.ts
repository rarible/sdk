import {
	Blockchain,
} from "@rarible/api-client"
import type { BlockchainWallet } from "@rarible/sdk-wallet"
import type { UnionAddress } from "@rarible/types"
import { toBigNumber } from "@rarible/types"
import type { MintRequest } from "@rarible/sdk/build/types/nft/mint/mint-request.type"
import { getTezosTestWallet, getWalletAddressFull } from "../../common/wallet"
import { testsConfig } from "../../common/config"
import { createSdk } from "../../common/create-sdk"
import { mint } from "../../common/atoms-tests/mint"
import { getCollection } from "../../common/helpers"
import { awaitForOwnershipValue, getOwnershipByIdRaw } from "../../common/api-helpers/ownership-helper"


function suites(): {
	blockchain: Blockchain,
	wallet: BlockchainWallet,
	collectionId: string,
	mintRequest: (address: UnionAddress) => MintRequest,
}[] {
	let allBlockchains = [
		{
			blockchain: Blockchain.TEZOS,
			wallet: getTezosTestWallet(0),
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
					supply: 50,
				}
			},
		},
	]
	return allBlockchains.filter(b => testsConfig.blockchain?.includes(b.blockchain))
}

describe.each(suites())("$blockchain api => ownership", (suite) => {
	const wallet = suite.wallet
	const sdk = createSdk(suite.blockchain, wallet)

	test("ownership controller", async () => {
		const address = await getWalletAddressFull(wallet)
		const collection = await getCollection(sdk, suite.collectionId)
		const { nft } = await mint(sdk, wallet, { collection },
			suite.mintRequest(address.unionAddress))

		await awaitForOwnershipValue(sdk, nft.id, address.address, toBigNumber(String(50)))

		await getOwnershipByIdRaw(sdk, nft.id, address.address)
	})
})
