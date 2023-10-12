import { Blockchain } from "@rarible/api-client"
import type { BlockchainWallet } from "@rarible/sdk-wallet"
import type { UnionAddress } from "@rarible/types"
import { toBigNumber } from "@rarible/types"
import type { MintRequest } from "@rarible/sdk/build/types/nft/mint/mint-request.type"
import type { GetOwnershipsByItem200 } from "@rarible/api-client/build/apis/OwnershipControllerApi"
import type { CreateCollectionRequestSimplified } from "@rarible/sdk/build/types/nft/deploy/simplified"
import { getEthereumWallet, getWalletAddressFull } from "../../../common/wallet"
import { createSdk } from "../../../common/create-sdk"
import { mint } from "../../../common/atoms-tests/mint"
import { awaitExpected, getCollection } from "../../../common/helpers"
import {
	awaitForOwnershipValue,
	getOwnershipByIdRaw,
	getOwnershipsByItem,
	getOwnershipsByItemRaw,
} from "../../../common/api-helpers/ownership-helper"
import { createCollection } from "../../../common/atoms-tests/create-collection"
import { ERC_1155_REQUEST } from "../../../common/config/settings-factory"

function suites(): {
	blockchain: Blockchain,
	wallet: BlockchainWallet,
	deployRequest: CreateCollectionRequestSimplified,
	mintRequest: (address: UnionAddress) => MintRequest,
}[] {
	return [
		{
			blockchain: Blockchain.ETHEREUM,
			wallet: getEthereumWallet(),
			deployRequest: ERC_1155_REQUEST,
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
}

describe.each(suites())("$blockchain api => ownership", (suite) => {
	const wallet = suite.wallet
	const sdk = createSdk(suite.blockchain, wallet)

	test("ownership controller", async () => {
		const address = await getWalletAddressFull(wallet)
		const { address: addressCollection } = await createCollection(sdk, wallet, suite.deployRequest)
		const collection = await getCollection(sdk, addressCollection)
		const { nft } = await mint(sdk, wallet, { collection },
			suite.mintRequest(address.unionAddress))

		await awaitForOwnershipValue(sdk, nft.id, address.address, toBigNumber(String(50)))

		await getOwnershipByIdRaw(sdk, nft.id, address.address)

		await awaitExpected(async () => {
			const ownerships = await getOwnershipsByItem(sdk, nft.contract!, nft.tokenId!)
			expect(ownerships.ownerships.length).toBeGreaterThanOrEqual(1)
			return ownerships
		})
		await awaitExpected(async () => {
			const ownershipAll = await getOwnershipsByItemRaw(sdk, nft.contract!, nft.tokenId!) as GetOwnershipsByItem200
			expect(ownershipAll.value.ownerships.length).toBeGreaterThanOrEqual(1)
			return ownershipAll
		})
	})
})
