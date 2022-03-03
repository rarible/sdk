import { Action } from "@rarible/action"
import { BlockchainFlowTransaction } from "@rarible/sdk-transaction"
import { Blockchain } from "@rarible/api-client"
import type { FlowNetwork, FlowSdk } from "@rarible/flow-sdk"
import type { CreateCollectionRequest } from "../../types/nft/deploy/domain"
import { convertFlowContractAddress } from "./common/converters"
import { prepareFlowRoyalties } from "./common/prepare-flow-royalties"

export class FlowCreateCollection {
	private readonly blockchain: Blockchain.FLOW

	constructor(
		private sdk: FlowSdk,
		private network: FlowNetwork,
	) {
		this.blockchain = Blockchain.FLOW
	}

	createCollection = Action.create({
		id: "send-tx" as const,
		run: async (request: CreateCollectionRequest) => {
			if (request.blockchain !== Blockchain.FLOW) {
				throw new Error("Wrong blockchain")
			}
			if (request.asset.assetType !== "FLOW_NFT") {
				throw new Error("Wrong asset type")
			}
			const {
				name,
				symbol,
				royalties,
				contractURI,
			} = request.asset.arguments
			const tx = await this.sdk.collection.createCollection({
				name,
				symbol,
				royalties: prepareFlowRoyalties(royalties),
				url: contractURI,
			})
			return {
				tx: new BlockchainFlowTransaction(tx, this.network),
				address: convertFlowContractAddress(`${tx.collectionId}`),
			}
		},
	})

}
