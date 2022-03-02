import { Blockchain } from "@rarible/api-client"
import { FLOW_TESTNET_ACCOUNT_1 } from "@rarible/flow-test-common"
import { toUnionAddress } from "@rarible/types"
import type { FlowCreateCollection } from "../create-collection"
import type { CreateCollectionResponse } from "../../../types/nft/deploy/domain"

export async function createCollectionTest(collectionService: FlowCreateCollection): Promise<CreateCollectionResponse> {
	const account = toUnionAddress(`${Blockchain.FLOW}:${FLOW_TESTNET_ACCOUNT_1.address}`)
	return collectionService.createCollection({
		blockchain: Blockchain.FLOW,
		asset: {
			assetType: "FLOW_NFT",
			arguments: {
				name: "Union:TestCollection",
				symbol: "UNION_TEST",
				royalties: [{
					account,
					value: 1000,
				}],
				description: "Test description",
				url: "http://",
				icon: "http://",
				supply: 1000,
			},
		},
	})
}
