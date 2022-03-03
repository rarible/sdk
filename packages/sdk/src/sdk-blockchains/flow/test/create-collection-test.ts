import { Blockchain } from "@rarible/api-client"
import type { FlowCreateCollection } from "../create-collection"
import type { CreateCollectionResponse } from "../../../types/nft/deploy/domain"

export async function createCollectionTest(collectionService: FlowCreateCollection): Promise<CreateCollectionResponse> {
	return collectionService.createCollection({
		blockchain: Blockchain.FLOW,
		asset: {
			assetType: "FLOW_NFT",
			arguments: {
				name: "Union:TestCollection",
				symbol: "UNION_TEST",
				royalties: [],
				baseURI: "ipfs/",
				contractURI: "",
				isUserToken: true,
			},
		},
	})
}
