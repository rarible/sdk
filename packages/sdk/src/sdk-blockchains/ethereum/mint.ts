import { Action } from "@rarible/action"
import type { RaribleSdk } from "@rarible/protocol-ethereum-sdk"
import * as EthereumSdk from "@rarible/protocol-ethereum-sdk"
import { isErc1155v2Collection, isErc721v2Collection, isErc721v3Collection } from "@rarible/protocol-ethereum-sdk"
import { MintResponseTypeEnum } from "@rarible/protocol-ethereum-sdk/build/nft/mint"
import { CollectionStatus } from "@rarible/api-client/build/models/Collection"
import { NftCollectionStatus } from "@rarible/ethereum-api-client/build/models/NftCollection"
import { toAddress, toBigNumber } from "@rarible/types"
import type { NftTokenId, Part } from "@rarible/ethereum-api-client"
import { NftCollectionFeatures, NftCollectionType } from "@rarible/ethereum-api-client"
import { toBn } from "@rarible/utils/build/bn"
import { BlockchainEthereumTransaction } from "@rarible/sdk-transaction"
import type { Collection, CollectionControllerApi, Creator, Royalty } from "@rarible/api-client"
import { Blockchain, CollectionType } from "@rarible/api-client"
import type { CommonNftCollection } from "@rarible/protocol-ethereum-sdk/build/common/mint"
import type { EthereumNetwork } from "@rarible/protocol-ethereum-sdk/build/types"
import type { CollectionMeta } from "@rarible/api-client/build/models/CollectionMeta"
import type { NftCollectionMeta } from "@rarible/ethereum-api-client/build/models/NftCollectionMeta"
import type { PrepareMintResponse, OffChainMintResponse, OnChainMintResponse } from "../../types/nft/mint/prepare"
import { MintType } from "../../types/nft/mint/prepare"
import type { MintRequest } from "../../types/nft/mint/mint-request.type"
import type { HasCollection, HasCollectionId, PrepareMintRequest } from "../../types/nft/mint/prepare-mint-request.type"
import type { TokenId } from "../../types/nft/generate-token-id"
import type { IApisSdk } from "../../domain"
import type { CommonTokenMetadataResponse, PreprocessMetaRequest } from "../../types/nft/mint/preprocess-meta"
import type { MintSimplifiedRequest } from "../../types/nft/mint/simplified"
import type { MintSimplifiedRequestOffChain, MintSimplifiedRequestOnChain } from "../../types/nft/mint/simplified"
import type { EVMBlockchain } from "./common"
import { convertEthereumItemId, convertToEthereumAddress, getEVMBlockchain } from "./common"

export class EthereumMint {
	private readonly blockchain: EVMBlockchain

	constructor(
		private readonly sdk: RaribleSdk,
		private readonly apis: IApisSdk,
		private network: EthereumNetwork,
	) {
		this.blockchain = getEVMBlockchain(network)
		this.prepare = this.prepare.bind(this)
		this.mintBasic = this.mintBasic.bind(this)
	}

	handleSubmit(request: MintRequest, nftCollection: CommonNftCollection, nftTokenId?: NftTokenId) {
		if (this.blockchain === Blockchain.POLYGON && request.lazyMint) {
			throw new Error("Lazy minting on polygon is not supported")
		}
		const isLazy = request.lazyMint ?? false
		const supply = request.supply ?? 1

		if (EthereumSdk.isErc721v3Collection(nftCollection)) {
			return this.sdk.nft.mint({
				collection: nftCollection,
				uri: request.uri,
				lazy: isLazy,
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
				supply,
				lazy: isLazy,
				royalties: this.toPart(request.royalties),
				creators: this.toPart(request.creators),
				nftTokenId,
			})
		}
		if (EthereumSdk.isErc1155v1Collection(nftCollection)) {
			return this.sdk.nft.mint({
				collection: nftCollection,
				uri: request.uri,
				supply,
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
		if (this.blockchain === Blockchain.POLYGON) {
			return false
		}
		return isErc721v3Collection(collection) || isErc1155v2Collection(collection)
	}

	async prepare(request: PrepareMintRequest): Promise<PrepareMintResponse> {
		const collection = await getCollection(this.apis.collection, request)
		if (!isSupportedCollection(collection.type)) {
			throw new Error(`Collection with type "${collection}" not supported`)
		}

		const nftCollection = toNftCollection(collection)

		return {
			multiple: collection.type === "ERC1155",
			supportsRoyalties: this.isSupportsRoyalties(nftCollection),
			supportsLazyMint: this.isSupportsLazyMint(nftCollection),
			submit: Action.create({
				id: "mint" as const,
				run: async (data: MintRequest) => {
					const mintResponse = await this.handleSubmit(
						data,
						nftCollection,
						toNftTokenId(request.tokenId),
					)

					switch (mintResponse.type) {
						case MintResponseTypeEnum.ON_CHAIN:
							return {
								type: MintType.ON_CHAIN,
								itemId: convertEthereumItemId(mintResponse.itemId, this.blockchain),
								transaction: new BlockchainEthereumTransaction(mintResponse.transaction, this.network),
							}
						case MintResponseTypeEnum.OFF_CHAIN:
							return {
								type: MintType.OFF_CHAIN,
								itemId: convertEthereumItemId(mintResponse.itemId, this.blockchain),
							}
						default:
							throw new Error("Unrecognized mint response type")
					}
				},
			}),
		}
	}

	// eslint-disable-next-line no-dupe-class-members
	mintBasic(request: MintSimplifiedRequestOnChain): Promise<OnChainMintResponse>;
	// eslint-disable-next-line no-dupe-class-members
	mintBasic(request: MintSimplifiedRequestOffChain): Promise<OffChainMintResponse>;
	// eslint-disable-next-line no-dupe-class-members
	async mintBasic(request: MintSimplifiedRequest) {
		const prepareResponse = await this.prepare(request)
		return prepareResponse.submit(request)
	}

	preprocessMeta(meta: PreprocessMetaRequest): CommonTokenMetadataResponse {
		if (meta.blockchain !== Blockchain.ETHEREUM && meta.blockchain !== Blockchain.POLYGON) {
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

	const convertStatus = (collectionStatus: CollectionStatus | undefined): NftCollectionStatus | undefined => {
		switch (collectionStatus) {
			case undefined: return undefined
			case CollectionStatus.ERROR: return NftCollectionStatus.ERROR
			case CollectionStatus.PENDING: return NftCollectionStatus.PENDING
			case CollectionStatus.CONFIRMED: return NftCollectionStatus.CONFIRMED
			default:
				throw new Error(`Unknown Collection Status (${collectionStatus})`)
		}
	}

	return {
		...collection,
		status: convertStatus(collection.status),
		id: toAddress(contract),
		type: NftCollectionType[collection.type],
		owner: collection.owner ? convertToEthereumAddress(collection.owner) : undefined,
		features: collection.features?.map(x => NftCollectionFeatures[x]),
		minters: collection.minters?.map(minter => convertToEthereumAddress(minter)),
		meta: convertCollectionMeta(collection.meta),
	}
}

function convertCollectionMeta(meta?: CollectionMeta): NftCollectionMeta | undefined {
	if (!meta) {
		return undefined
	}
	const feeRecipient = meta.feeRecipient !== undefined ? toAddress(meta.feeRecipient): undefined
	return {
		name: meta.name,
		description: meta.description,
		createdAt: meta.createdAt,
		tags: meta.tags || [],
		genres: meta.genres || [],
		language: meta.language,
		rights: meta.rights,
		rightsUri: meta.rightsUri,
		externalUri: meta.externalUri,
		originalMetaUri: meta.originalMetaUri,
		sellerFeeBasisPoints: meta.sellerFeeBasisPoints,
		content: meta.content,
		feeRecipient: feeRecipient,
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
