import type { Maybe } from "@rarible/types/build/maybe"
import type { Provider } from "tezos-sdk-module/dist/common/base"
import { Action } from "@rarible/action"
import { mint } from "tezos-sdk-module"
import type { NftCollectionControllerApi } from "tezos-api-client/build"
import BigNumber from "bignumber.js"
import { toBn } from "@rarible/utils/build/bn"
import { BlockchainTezosTransaction } from "@rarible/sdk-transaction/src"
import { toItemId } from "@rarible/types"
import type { PrepareMintRequest } from "../../types/nft/mint/prepare-mint-request.type"
import type { PrepareMintResponse } from "../../types/nft/mint/domain"
import type { MintRequest } from "../../types/nft/mint/mint-request.type"
import type { HasCollection, HasCollectionId } from "../../types/nft/mint/prepare-mint-request.type"
import { MintType } from "../../types/nft/mint/domain"
import type { ITezosAPI } from "./common"
import { getTezosAddress } from "./common"

export class TezosMint {
	constructor(
		private provider: Maybe<Provider>,
		private apis: ITezosAPI,
	) {
		this.mint = this.mint.bind(this)
	}

	private getRequiredProvider(): Provider {
		if (!this.provider) {
			throw new Error("Tezos provider is required")
		}
		return this.provider
	}

	getCreators(request: MintRequest): string | undefined {
		const [owner] = request.creators || []
		return owner?.account ? getTezosAddress(owner?.account) : undefined
	}

	async mint(prepareRequest: PrepareMintRequest): Promise<PrepareMintResponse> {
		const { contract, owner, type } = await getCollectionData(this.apis.collection, prepareRequest)

		return {
			multiple: type === "MT",
			supportsRoyalties: true,
			supportsLazyMint: false,
			submit: Action.create({
				id: "mint" as const,
				run: async (request: MintRequest) => {
					const royalties = request.royalties?.reduce((acc, royalty) => {
						const account = getTezosAddress(royalty.account)
						acc[account] = new BigNumber(royalty.value)
						return acc
					}, {} as {[key: string]: BigNumber}) || {}

					const supply = type === "NFT" ? undefined : toBn(request.supply)

					console.log("before mint", contract,
						royalties,
						supply,
						prepareRequest.tokenId ? toBn(prepareRequest.tokenId.tokenId) : undefined,
						undefined,
						owner)
					const result = await mint(
						this.getRequiredProvider(),
						contract,
						royalties,
						supply,
						prepareRequest.tokenId ? toBn(prepareRequest.tokenId.tokenId) : undefined,
						{  },
						owner,
					)

					return {
						type: MintType.ON_CHAIN,
						transaction: new BlockchainTezosTransaction(result),
						itemId: toItemId(`TEZOS:${contract}:${result.token_id}`),
					}
				},
			}),
		}
	}
}

export async function getCollectionData(
	api: NftCollectionControllerApi,
	prepareRequest: HasCollection | HasCollectionId,
): Promise<{contract: string, owner?: string, type: "NFT" | "MT" }> {
	if ("collection" in prepareRequest) {
		const [blockchain, contract] = prepareRequest.collection.id.split(":")
		if (blockchain !== "TEZOS") {
			throw new Error(`Unsupported blockchain of collection: ${blockchain}`)
		}
		const owner = prepareRequest.collection.owner?.split(":")[1] || undefined

		return {
			contract,
			owner,
			//todo fix after api-client supporting new types
			type: prepareRequest.collection.type as any,
		}
	} else if ("collectionId" in prepareRequest) {
		const [blockchain, contract] = prepareRequest.collectionId.split(":")
		if (blockchain !== "TEZOS") {
			throw new Error(`Unsupported blockchain of collection: ${blockchain}`)
		}
		const collection = await api.getNftCollectionById({
			collection: contract,
		})
		console.log("collection", collection)
		return {
			contract,
			owner: collection.owner,
			type: collection.type,
		}
	} else {
		throw new Error("Wrong request: collection or collectionId has not been found")
	}
}
