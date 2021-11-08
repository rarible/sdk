import { Action } from "@rarible/action"
import type { RaribleSdk } from "@rarible/protocol-ethereum-sdk"
import * as EthereumSdk from "@rarible/protocol-ethereum-sdk"
import { MintResponseTypeEnum } from "@rarible/protocol-ethereum-sdk/build/nft/mint"
import { toAddress, toItemId } from "@rarible/types"
import type { NftCollection, NftTokenId } from "@rarible/ethereum-api-client"
import { NftCollectionFeatures, NftCollectionType } from "@rarible/ethereum-api-client"
import { toBn } from "@rarible/utils/build/bn"
import { BlockchainEthereumTransaction } from "@rarible/sdk-transaction"
import { prepareMintRequest } from "@rarible/protocol-ethereum-sdk/build/nft/prepare-mint-request"
import type { Collection, CollectionControllerApi } from "@rarible/api-client"
import type { PrepareMintResponse } from "../../types/nft/mint/domain"
import { MintType } from "../../types/nft/mint/domain"
import type { MintRequest } from "../../types/nft/mint/mint-request.type"
import type { HasCollection, HasCollectionId, PrepareMintRequest } from "../../types/nft/mint/prepare-mint-request.type"
import { validatePrepareMintRequest } from "../../types/nft/mint/prepare-mint-request.type.validator"
import { validateMintRequest } from "../../types/nft/mint/mint-request.type.validator"
import type { IApisSdk } from "../../domain"
import { convertUnionToEthereumAddress } from "./common"

export class EthereumMint {
	constructor(private readonly sdk: RaribleSdk, private readonly apis: IApisSdk) {
		this.prepare = this.prepare.bind(this)
	}

	handleSubmit(request: MintRequest, nftCollection: NftCollection, nftTokenId?: NftTokenId) {
		if (EthereumSdk.isErc721v1Collection(nftCollection)) {
			return this.sdk.nft.mint({
				collection: nftCollection,
				uri: request.uri,
				nftTokenId,
			})
		}
		if (EthereumSdk.isErc721v2Collection(nftCollection)) {
			return this.sdk.nft.mint({
				collection: nftCollection,
				uri: request.uri,
				royalties: (request.royalties || []).map(r => ({
					account: convertUnionToEthereumAddress(r.account),
					value: toBn(r.value).toNumber(),
				})),
				nftTokenId,
			})
		}
		if (EthereumSdk.isErc721v3Collection(nftCollection)) {
			return this.sdk.nft.mint({
				collection: nftCollection,
				uri: request.uri,
				lazy: request.lazyMint,
				royalties: (request.royalties || []).map(r => ({
					account: convertUnionToEthereumAddress(r.account),
					value: toBn(r.value).toNumber(),
				})),
				creators: (request.creators || []).map(c => ({
					account: convertUnionToEthereumAddress(c.account),
					value: toBn(c.value).toNumber(),
				})),
				nftTokenId,
			})
		}

		if (EthereumSdk.isErc1155v1Collection(nftCollection)) {
			return this.sdk.nft.mint({
				collection: nftCollection,
				uri: request.uri,
				supply: request.supply,
				royalties: (request.royalties || []).map(r => ({
					account: convertUnionToEthereumAddress(r.account),
					value: toBn(r.value).toNumber(),
				})),
				nftTokenId,
			})
		}

		if (EthereumSdk.isErc1155v2Collection(nftCollection)) {
			return this.sdk.nft.mint({
				collection: nftCollection,
				uri: request.uri,
				supply: request.supply,
				lazy: request.lazyMint,
				royalties: (request.royalties || []).map(r => ({
					account: convertUnionToEthereumAddress(r.account),
					value: toBn(r.value).toNumber(),
				})),
				creators: (request.creators || []).map(c => ({
					account: convertUnionToEthereumAddress(c.account),
					value: toBn(c.value).toNumber(),
				})),
				nftTokenId,
			})
		}

		throw new Error("Unsupported NFT Collection")
	}

	async prepare(prepareRequest: PrepareMintRequest): Promise<PrepareMintResponse> {
		const collection = await getCollection(this.apis.collection, prepareRequest)
		if (collection.type === "CRYPTO_PUNKS" || collection.type === "FLOW" || collection.type === "TEZOS") {
			throw new Error("Unsupported collection type")
		}

		validatePrepareMintRequest(prepareRequest)

		const nftCollection: NftCollection = toNftCollection(collection)
		const prepareMintRequestData = prepareMintRequest(nftCollection)

		return {
			...prepareMintRequestData,
			submit: Action.create({
				id: "mint" as const,
				run: async (request: MintRequest) => {

					validateMintRequest(request)
					const mintResponse = await this.handleSubmit(request, nftCollection, prepareRequest.tokenId)

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
	} else {
		return api.getCollectionById({ collection: req.collectionId })
	}
}

function toNftCollection(collection: Collection): NftCollection {
	const [domain, address] = collection.id.split(":")
	if (domain !== "ETHEREUM") {
		throw new Error(`Not an ethereum collection: ${JSON.stringify(collection)}`)
	}
	if (collection.type === "FLOW" || collection.type === "TEZOS") {
		throw new Error(`Collection ${JSON.stringify(collection)} not supported`)
	}
	return {
		...collection,
		id: toAddress(address),
		type: NftCollectionType[collection.type],
		owner: collection.owner && convertUnionToEthereumAddress(collection.owner),
		name: collection.name,
		symbol: collection.symbol,
		features: collection.features?.map(feature => NftCollectionFeatures[feature]),
	}
}
