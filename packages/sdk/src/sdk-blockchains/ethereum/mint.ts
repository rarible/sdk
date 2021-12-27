import { Action } from "@rarible/action"
import type { RaribleSdk } from "@rarible/protocol-ethereum-sdk"
import * as EthereumSdk from "@rarible/protocol-ethereum-sdk"
import { isErc1155v2Collection, isErc721v2Collection, isErc721v3Collection } from "@rarible/protocol-ethereum-sdk"
import { MintResponseTypeEnum } from "@rarible/protocol-ethereum-sdk/build/nft/mint"
import { toAddress, toBigNumber } from "@rarible/types"
import type { NftTokenId, Part } from "@rarible/ethereum-api-client"
import { NftCollectionFeatures, NftCollectionType } from "@rarible/ethereum-api-client"
import { toBn } from "@rarible/utils/build/bn"
import { BlockchainEthereumTransaction } from "@rarible/sdk-transaction"
import type { Collection, CollectionControllerApi, Creator, Royalty } from "@rarible/api-client"
import { CollectionType } from "@rarible/api-client"
import type { CommonNftCollection } from "@rarible/protocol-ethereum-sdk/build/common/mint"
import type { EthereumNetwork } from "@rarible/protocol-ethereum-sdk/build/types"
import type { PrepareMintResponse } from "../../types/nft/mint/domain"
import { MintType } from "../../types/nft/mint/domain"
import type { MintRequest } from "../../types/nft/mint/mint-request.type"
import type { HasCollection, HasCollectionId, PrepareMintRequest } from "../../types/nft/mint/prepare-mint-request.type"
import { validatePrepareMintRequest } from "../../types/nft/mint/prepare-mint-request.type.validator"
import type { TokenId } from "../../types/nft/generate-token-id"
import { validateMintRequest } from "../../types/nft/mint/mint-request.type.validator"
import type { IApisSdk } from "../../domain"
import type { PreprocessMetaRequest } from "../../types/nft/mint/preprocess-meta"
import type { CommonTokenMetadataResponse } from "../../types/nft/mint/preprocess-meta"
import { convertToEthereumAddress, convertEthereumItemId } from "./common"

export class EthereumMint {
	constructor(
		private readonly sdk: RaribleSdk,
		private readonly apis: IApisSdk,
		private network: EthereumNetwork,
	) {
		this.prepare = this.prepare.bind(this)
	}

	handleSubmit(request: MintRequest, nftCollection: CommonNftCollection, nftTokenId?: NftTokenId) {
		if (EthereumSdk.isErc721v3Collection(nftCollection)) {
			return this.sdk.nft.mint({
				collection: nftCollection,
				uri: request.uri,
				lazy: request.lazyMint,
				royalties: this.toPart(request.royalties),
				creators: this.toPart(request.creators),
				nftTokenId,
			})
		}
		if (EthereumSdk.isErc721v2Collection(nftCollection)) {
			return this.sdk.nft.mint({
				collection: nftCollection,
				uri: request.uri,
				royalties: this.toPart(request.royalties),
				nftTokenId,
			})
		}
		if (EthereumSdk.isErc721v1Collection(nftCollection)) {
			return this.sdk.nft.mint({
				collection: nftCollection,
				uri: request.uri,
				nftTokenId,
			})
		}
		if (EthereumSdk.isErc1155v2Collection(nftCollection)) {
			return this.sdk.nft.mint({
				collection: nftCollection,
				uri: request.uri,
				supply: request.supply,
				lazy: request.lazyMint,
				royalties: this.toPart(request.royalties),
				creators: this.toPart(request.creators),
				nftTokenId,
			})
		}
		if (EthereumSdk.isErc1155v1Collection(nftCollection)) {
			return this.sdk.nft.mint({
				collection: nftCollection,
				uri: request.uri,
				supply: request.supply,
				royalties: this.toPart(request.royalties),
				nftTokenId,
			})
		}
		throw new Error("Unsupported NFT Collection")
	}

	private toPart(royalties: Royalty[] | Creator[] = []): Part[] {
		return royalties.map(r => ({
			account: convertToEthereumAddress(r.account),
			value: toBn(r.value).toNumber(),
		}))
	}

	isSupportsRoyalties(collection: CommonNftCollection): boolean {
		if (collection.type === "ERC721") {
			return isErc721v3Collection(collection) || isErc721v2Collection(collection)
		} else if (collection.type === "ERC1155") {
			return true
		} else {
			throw new Error("Unrecognized collection type")
		}
	}

	isSupportsLazyMint(collection: CommonNftCollection): boolean {
		return isErc721v3Collection(collection) || isErc1155v2Collection(collection)
	}

	async prepare(requestRaw: PrepareMintRequest): Promise<PrepareMintResponse> {
		const collection = await getCollection(this.apis.collection, requestRaw)
		if (!isSupportedCollection(collection.type)) {
			throw new Error(`Collection with type "${collection}" not supported`)
		}

		const request = validatePrepareMintRequest(requestRaw)
		const nftCollection = toNftCollection(collection)

		return {
			multiple: collection.type === "ERC1155",
			supportsRoyalties: this.isSupportsRoyalties(nftCollection),
			supportsLazyMint: this.isSupportsLazyMint(nftCollection),
			submit: Action.create({
				id: "mint" as const,
				run: async (data: MintRequest) => {
					const validated = validateMintRequest(data)
					const mintResponse = await this.handleSubmit(
						validated,
						nftCollection,
						toNftTokenId(request.tokenId)
					)

					switch (mintResponse.type) {
						case MintResponseTypeEnum.ON_CHAIN:
							return {
								type: MintType.ON_CHAIN,
								itemId: convertEthereumItemId(mintResponse.itemId),
								transaction: new BlockchainEthereumTransaction(mintResponse.transaction, this.network),
							}
						case MintResponseTypeEnum.OFF_CHAIN:
							return {
								type: MintType.OFF_CHAIN,
								itemId: convertEthereumItemId(mintResponse.itemId),
							}
						default:
							throw new Error("Unrecognized mint response type")
					}
				},
			}),
		}
	}

	preprocessMeta(meta: PreprocessMetaRequest): CommonTokenMetadataResponse {
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

export async function getCollection(
	api: CollectionControllerApi, req: HasCollection | HasCollectionId,
): Promise<Collection> {
	if ("collection" in req) {
		return req.collection
	}
	return api.getCollectionById({ collection: req.collectionId })
}

function toNftCollection(collection: Collection): CommonNftCollection {
	const contract = convertToEthereumAddress(collection.id)
	if (!isSupportedCollection(collection.type)) {
		throw new Error(`Collection with type "${collection}" not supported`)
	}
	return {
		...collection,
		id: toAddress(contract),
		type: NftCollectionType[collection.type],
		owner: collection.owner ? convertToEthereumAddress(collection.owner) : undefined,
		features: collection.features?.map(x => NftCollectionFeatures[x]),
	}
}

function isSupportedCollection(type: Collection["type"]): type is  CollectionType.ERC721 | CollectionType.ERC1155 {
	return type === CollectionType.ERC721 || type === CollectionType.ERC1155
}

function toNftTokenId(tokenId: TokenId | undefined): NftTokenId | undefined {
	if (tokenId) {
		return {
			tokenId: toBigNumber(tokenId.tokenId),
			signature: tokenId.signature,
		}
	}
	return undefined
}
