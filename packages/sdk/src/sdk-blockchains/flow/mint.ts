import { Action } from "@rarible/action"
import { FlowSdk } from "@rarible/flow-sdk"
import { BlockchainFlowTransaction } from "@rarible/sdk-transaction"
import { toItemId } from "@rarible/types"
import { MintType, PrepareMintResponse } from "../../nft/mint/domain"
import { PrepareMintRequest } from "../../nft/mint/prepare-mint-request.type"
import { validatePrepareMintRequest } from "../../nft/mint/prepare-mint-request.type.validator"
import { MintRequest } from "../../nft/mint/mint-request.type"
import { IApisSdk } from "../../domain"
import { getCollection } from "../ethereum/mint"
import { getFlowCollection } from "./common/converters"
import { prepareFlowRoyalties } from "./common/prepare-flow-royalties"

export class FlowMint {
	constructor(
		private readonly sdk: FlowSdk,
		private readonly apis: IApisSdk,
	) {
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
}
