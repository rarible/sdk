import { Action } from "@rarible/action"
import type { TezosNetwork, TezosProvider } from "@rarible/tezos-sdk"
// eslint-disable-next-line camelcase
import { get_address, mint } from "@rarible/tezos-sdk"
import BigNumber from "bignumber.js"
import { toBn } from "@rarible/utils/build/bn"
import { BlockchainTezosTransaction } from "@rarible/sdk-transaction"
import type { CollectionId } from "@rarible/api-client"
import { Blockchain, CollectionType } from "@rarible/api-client"
import type { HasCollection, HasCollectionId, PrepareMintRequest } from "../../types/nft/mint/prepare-mint-request.type"
import type { PrepareMintResponse } from "../../types/nft/mint/domain"
import { MintType } from "../../types/nft/mint/domain"
import type { MintRequest } from "../../types/nft/mint/mint-request.type"
import type { PreprocessMetaRequest } from "../../types/nft/mint/preprocess-meta"
import type { IApisSdk } from "../../domain"
import type { MaybeProvider, TezosMetaContent, TezosMetadataResponse } from "./common"
import { checkChainId, convertTezosItemId, getCollectionType, getRequiredProvider, getTezosAddress } from "./common"

export class TezosMint {
	constructor(
		private provider: MaybeProvider<TezosProvider>,
		private unionAPI: IApisSdk,
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
		if (meta.blockchain !== Blockchain.TEZOS) {
			throw new Error("Wrong blockchain")
		}

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
		await checkChainId(this.provider)

		const {
			contract,
			type,
		} = await getCollectionData(this.unionAPI, prepareRequest)

		return {
			multiple: type === CollectionType.TEZOS_MT,
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

					const collectionType = await getCollectionType(this.provider, contract)
					const supply = collectionType === CollectionType.TEZOS_NFT ? undefined : toBn(request.supply)
					const provider = getRequiredProvider(this.provider)

					const result = await mint(
						provider,
						contract,
						royalties,
						supply,
						undefined,
						{
							"": fixIpfs(request.uri),
						},
						await this.getOwner(request),
					)

					return {
						type: MintType.ON_CHAIN,
						transaction: new BlockchainTezosTransaction(result, this.network),
						itemId: convertTezosItemId(`${contract}:${result.token_id}`),
					}
				},
			}),
		}
	}
}

export async function getCollectionData(
	unionAPI: IApisSdk,
	prepareRequest: HasCollection | HasCollectionId,
) {
	const contractAddress = getContractFromRequest(prepareRequest)
	const [blockchain, contract] = contractAddress.split(":")
	if (blockchain !== Blockchain.TEZOS) {
		throw new Error(`Unsupported blockchain of collection: ${blockchain}`)
	}
	const collection = await unionAPI.collection.getCollectionById({
		collection: contractAddress,
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

export function getContractFromRequest(request: HasCollection | HasCollectionId): CollectionId {
	if ("collection" in request) return request.collection.id
	if ("collectionId" in request) return request.collectionId
	throw new Error("Wrong request: collection or collectionId has not been found")
}

function fixIpfs(link: string): string {
	return link.replace("ipfs://ipfs/", "ipfs://")
}
