import type { AptosSdk } from "@rarible/aptos-sdk"
import { Action } from "@rarible/action"
import { toItemId } from "@rarible/types"
import { extractId } from "@rarible/sdk-common"
import type { PrepareMintRequest } from "../../types/nft/mint/prepare-mint-request.type"
import type { PrepareMintResponse } from "../../types/nft/mint/prepare"
import type { MintRequest } from "../../types/nft/mint/mint-request.type"
import { MintType } from "../../types/nft/mint/prepare"
import type { IApisSdk } from "../../domain"
import { getCollectionId } from "../../common/get-collection-id"

export class AptosNft {
	constructor(
		private readonly sdk: AptosSdk,
		private readonly apis: IApisSdk,
	) {
	}

	async mint(prepareRequest: PrepareMintRequest): Promise<PrepareMintResponse> {
  	return {
  		multiple: false,
  		supportsRoyalties: false,
  		supportsLazyMint: false,
  		submit: Action.create({
  			id: "mint" as const,
  			run: async (request: MintRequest) => {
					const unionColectionId = getCollectionId(prepareRequest)
  				const collection = await this.apis.collection.getCollectionById({
						collection: unionColectionId,
					})
					const aptosCollectionId = extractId(unionColectionId)
  				const { tx, tokenAddress } = await this.sdk.nft.mintWithCollectionAddress({
						collectionAddress: aptosCollectionId,
						name: "",
						description: "",
						uri: request.uri,
  				})

  				return {
  					type: MintType.ON_CHAIN,
  					transaction: tx,
  					itemId: toItemId(`APTOS:${tokenAddress}`),
  				}
  			},
  		}),
  	}
	}
}
