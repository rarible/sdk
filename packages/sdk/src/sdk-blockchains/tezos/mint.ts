import { Action } from "@rarible/action"
// eslint-disable-next-line camelcase
import { get_address, mint } from "tezos-sdk-module"
import type { NftCollectionControllerApi } from "tezos-api-client/build"
import BigNumber from "bignumber.js"
import { toBn } from "@rarible/utils/build/bn"
import { BlockchainTezosTransaction } from "@rarible/sdk-transaction"
import type { ContractAddress } from "@rarible/types"
import { toItemId } from "@rarible/types"
import type { TezosProvider } from "tezos-sdk-module/dist/common/base"
import type { TezosNetwork } from "tezos-sdk-module/dist/common/base"
import type { PrepareMintRequest } from "../../types/nft/mint/prepare-mint-request.type"
import type { PrepareMintResponse } from "../../types/nft/mint/domain"
import type { MintRequest } from "../../types/nft/mint/mint-request.type"
import type { HasCollection, HasCollectionId } from "../../types/nft/mint/prepare-mint-request.type"
import { MintType } from "../../types/nft/mint/domain"
import type { PreprocessMetaRequest } from "../../types/nft/mint/preprocess-meta"
import type { ITezosAPI, MaybeProvider, TezosMetadataResponse, TezosMetaContent } from "./common"
import { getRequiredProvider, getTezosAddress } from "./common"

export class TezosMint {
	constructor(
		private provider: MaybeProvider<TezosProvider>,
		private apis: ITezosAPI,
		private network: TezosNetwork,
	) {
		this.mint = this.mint.bind(this)
		this.preprocessMeta = this.preprocessMeta.bind(this)
	}

	getFormatsMeta(meta: PreprocessMetaRequest) {
		return [meta.image, meta.animation]
			.reduce((acc, item) => {
				if (item) {
					const { url, ...rest } = item
					return acc.concat({ ...rest, uri: fixIpfs(url) })
				}
				return acc
			}, [] as TezosMetaContent[])
	}

	preprocessMeta(meta: PreprocessMetaRequest): TezosMetadataResponse {
		const artifact = meta.animation || meta.image
		return {
			name: meta.name,
			decimals: 0,
			description: meta.description,
			artifactUri: artifact ? fixIpfs(artifact.url) : undefined,
			displayUri: meta.image ? fixIpfs(meta.image.url) : undefined,
			attributes: meta.attributes?.map(attr => ({
				name: attr.key,
				value: attr.value,
				type: attr.type,
			})),
			formats: this.getFormatsMeta(meta),
		}
	}

	async getOwner(request: MintRequest): Promise<string> {
		if (request.creators?.length) {
			return getTezosAddress(request.creators[0].account)
		}
		return get_address(
			getRequiredProvider(this.provider),
		)
	}

	async mint(prepareRequest: PrepareMintRequest): Promise<PrepareMintResponse> {
		const {
			contract,
			type,
		} = await getCollectionData(this.apis.collection, prepareRequest)

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
					}, {} as { [key: string]: BigNumber }) || {}

					const supply = type === "NFT" ? undefined : toBn(request.supply)
					const provider = getRequiredProvider(this.provider)

					const result = await mint(
						provider,
						contract,
						royalties,
						supply,
						prepareRequest.tokenId ? toBn(prepareRequest.tokenId.tokenId) : undefined,
						{
							"": fixIpfs(request.uri),
						},
						await this.getOwner(request),
					)

					return {
						type: MintType.ON_CHAIN,
						transaction: new BlockchainTezosTransaction(result, this.network),
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
): Promise<{ contract: string, owner?: string, type: "NFT" | "MT" }> {
	const contractAddress = getContractFromRequest(prepareRequest)
	const [blockchain, contract] = contractAddress.split(":")
	if (blockchain !== "TEZOS") {
		throw new Error(`Unsupported blockchain of collection: ${blockchain}`)
	}
	const collection = await api.getNftCollectionById({
		collection: contract,
	})
	if (!collection) {
		throw new Error(`Tezos collection with address=${contract} has not been found`)
	}
	return {
		contract,
		owner: collection.owner,
		type: collection.type,
	}
}

export function getContractFromRequest(request: HasCollection | HasCollectionId): ContractAddress {
	if ("collection" in request) return request.collection.id
	if ("collectionId" in request) return request.collectionId
	throw new Error("Wrong request: collection or collectionId has not been found")
}

function fixIpfs(link: string): string {
	return link.replace("ipfs://ipfs/", "ipfs://")
}
