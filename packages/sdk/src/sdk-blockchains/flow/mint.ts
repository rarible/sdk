import { Action } from "@rarible/action"
import type { FlowSdk } from "@rarible/flow-sdk"
import { BlockchainFlowTransaction } from "@rarible/sdk-transaction"
import type { FlowNetwork } from "@rarible/flow-sdk/build/types"
import { Blockchain } from "@rarible/api-client"
import type { PrepareMintResponse } from "../../types/nft/mint/domain"
import { MintType } from "../../types/nft/mint/domain"
import type { PrepareMintRequest } from "../../types/nft/mint/prepare-mint-request.type"
import type { MintRequest } from "../../types/nft/mint/mint-request.type"
import type { IApisSdk } from "../../domain"
import { getCollection } from "../ethereum/mint"
import type { CommonTokenMetadataResponse, PreprocessMetaRequest } from "../../types/nft/mint/preprocess-meta"
import { convertFlowItemId, getFlowCollection } from "./common/converters"
import { prepareFlowRoyalties } from "./common/prepare-flow-royalties"

export class FlowMint {
	constructor(
		private readonly sdk: FlowSdk,
		private readonly apis: IApisSdk,
		private network: FlowNetwork,
	) {
		this.prepare = this.prepare.bind(this)
	}

	async prepare(prepareRequest: PrepareMintRequest): Promise<PrepareMintResponse> {
		const collection = await getCollection(this.apis.collection, prepareRequest)
		if (collection.type === "FLOW") {
			const flowCollection = getFlowCollection(collection.id)
			return {
				multiple: false,
				supportsRoyalties: true,
				supportsLazyMint: false,
				submit: Action.create({
					id: "mint" as const,
					run: async (request: MintRequest) => {
						const mintResponse = await this.sdk.nft.mint(
							flowCollection,
							request.uri,
							prepareFlowRoyalties(request.royalties),
						)
						return {
							type: MintType.ON_CHAIN,
							itemId: convertFlowItemId(mintResponse.tokenId),
							transaction: new BlockchainFlowTransaction(mintResponse, this.network),
						}
					},
				}),
			}
		}
		throw new Error("Unsupported collection type")
	}

	preprocessMeta(meta: PreprocessMetaRequest): CommonTokenMetadataResponse {
		if (meta.blockchain !== Blockchain.FLOW) {
			throw new Error("Wrong blockchain")
		}

		return {
			name: meta.name,
			description: meta.description,
			image: meta.image?.url,
			animation_url: meta.animation?.url,
			external_url: meta.external,
			attributes: meta.attributes,
		}
	}
}
