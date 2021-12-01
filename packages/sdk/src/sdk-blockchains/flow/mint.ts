import { Action } from "@rarible/action"
import type { FlowSdk } from "@rarible/flow-sdk"
import { BlockchainFlowTransaction } from "@rarible/sdk-transaction"
import { toItemId } from "@rarible/types"
import type { PrepareMintResponse } from "../../types/nft/mint/domain"
import { MintType } from "../../types/nft/mint/domain"
import type { PrepareMintRequest } from "../../types/nft/mint/prepare-mint-request.type"
import { validatePrepareMintRequest } from "../../types/nft/mint/prepare-mint-request.type.validator"
import type { MintRequest } from "../../types/nft/mint/mint-request.type"
import type { IApisSdk } from "../../domain"
import { getCollection } from "../ethereum/mint"
import type { PreprocessMetaRequest } from "../../types/nft/mint/preprocess-meta"
import type { CommonTokenMetadata } from "../../types/nft/mint/preprocess-meta"
import { getFlowCollection } from "./common/converters"
import { prepareFlowRoyalties } from "./common/prepare-flow-royalties"

export class FlowMint {
	constructor(private readonly sdk: FlowSdk, private readonly apis: IApisSdk) {
		this.prepare = this.prepare.bind(this)
	}

	async prepare(prepareRequest: PrepareMintRequest): Promise<PrepareMintResponse> {
		const collection = await getCollection(this.apis.collection, prepareRequest)
		if (collection.type === "FLOW") {
			validatePrepareMintRequest(prepareRequest)
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
							itemId: toItemId(`FLOW:${flowCollection}:${mintResponse.tokenId}`),
							transaction: new BlockchainFlowTransaction(mintResponse),
						}
					},
				}),
			}
		}
		throw new Error("Unsupported collection type")
	}

	preprocessMeta(meta: PreprocessMetaRequest): CommonTokenMetadata {
		return meta
	}
}
