import { Action } from "@rarible/action"
import type { RaribleSdk } from "@rarible/protocol-ethereum-sdk"
import * as EthereumSdk from "@rarible/protocol-ethereum-sdk"
import { MintResponseTypeEnum } from "@rarible/protocol-ethereum-sdk/build/nft/mint"
import { toAddress, toBigNumber, toItemId } from "@rarible/types"
import type { NftCollection, NftTokenId, Part } from "@rarible/ethereum-api-client"
import { NftCollectionFeatures, NftCollectionType } from "@rarible/ethereum-api-client"
import { toBn } from "@rarible/utils/build/bn"
import { BlockchainEthereumTransaction } from "@rarible/sdk-transaction"
import { prepareMintRequest } from "@rarible/protocol-ethereum-sdk/build/nft/prepare-mint-request"
import type { Collection, CollectionControllerApi, Creator, Royalty } from "@rarible/api-client"
import type { PrepareMintResponse } from "../../types/nft/mint/domain"
import { MintType } from "../../types/nft/mint/domain"
import type { MintRequest } from "../../types/nft/mint/mint-request.type"
import type { HasCollection, HasCollectionId, PrepareMintRequest } from "../../types/nft/mint/prepare-mint-request.type"
import { validatePrepareMintRequest } from "../../types/nft/mint/prepare-mint-request.type.validator"
import type { TokenId } from "../../types/nft/generate-token-id"
import { validateMintRequest } from "../../types/nft/mint/mint-request.type.validator"
import type { IApisSdk } from "../../domain"
import { convertUnionToEthereumAddress } from "./common"

export class EthereumMint {
	constructor(private readonly sdk: RaribleSdk, private readonly apis: IApisSdk) {
		this.prepare = this.prepare.bind(this)
	}

	handleSubmit(request: MintRequest, nftCollection: NftCollection, nftTokenId?: NftTokenId) {
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
			account: convertUnionToEthereumAddress(r.account),
			value: toBn(r.value).toNumber(),
		}))
	}

	async prepare(requestRaw: PrepareMintRequest): Promise<PrepareMintResponse> {
		const collection = await getCollection(this.apis.collection, requestRaw)
		if (!isSupportedCollection(collection.type)) {
			throw new Error(`Collection with type "${collection}" not supported`)
		}

		const request = validatePrepareMintRequest(requestRaw)
		const nftCollection: NftCollection = toNftCollection(collection)
		const prepareData = prepareMintRequest(nftCollection)

		return {
			...prepareData,
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
								itemId: toItemId(`ETHEREUM:${mintResponse.itemId}`),
								transaction: new BlockchainEthereumTransaction(mintResponse.transaction),
							}
						case MintResponseTypeEnum.OFF_CHAIN:
							return {
								type: MintType.OFF_CHAIN,
								itemId: toItemId(`ETHEREUM:${mintResponse.itemId}`),
							}
						default:
							throw new Error("Unrecognized mint response type")
					}
				},
			}),
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

function toNftCollection(collection: Collection): NftCollection {
	const contract = convertUnionToEthereumAddress(collection.id)
	if (!isSupportedCollection(collection.type)) {
		throw new Error(`Collection with type "${collection}" not supported`)
	}
	return {
		...collection,
		id: toAddress(contract),
		type: NftCollectionType[collection.type],
		owner: collection.owner ? convertUnionToEthereumAddress(collection.owner) : undefined,
		features: collection.features?.map(x => NftCollectionFeatures[x]),
	}
}

function isSupportedCollection(type: Collection["type"]): type is "ERC721" | "ERC1155" {
	return ["ERC721", "ERC1155"].indexOf(type) !== -1
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