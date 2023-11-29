import type { Ethereum } from "@rarible/ethereum-provider"
import type { Address } from "@rarible/types"
import { toAddress, toUnionAddress } from "@rarible/types"
import type * as ApiClient from "@rarible/api-client"
import { convertToEVMAddress } from "@rarible/sdk-common"
import type { SendFunction } from "../common/send-transaction"
import { sanitizeUri } from "../common/sanitize-uri"
import {
	createUnionAddressWithChainId,
	createUnionItemIdWithCollectionId,
} from "../common/union-converters"
import type { ERC1155RequestV1, ERC1155RequestV2, ERC721RequestV1, ERC721RequestV2, ERC721RequestV3, MintOnChainResponse } from "./mint"
import { MintResponseTypeEnum } from "./mint"
import { getTokenId } from "./get-token-id"
import { getErc721Contract } from "./contracts/erc721"
import { ERC1155VersionEnum, ERC721VersionEnum } from "./contracts/domain"
import { getErc1155Contract } from "./contracts/erc1155"

export async function mintErc721v1(
	ethereum: Ethereum,
	send: SendFunction,
	nftCollectionApi: ApiClient.CollectionControllerApi,
	data: ERC721RequestV1
): Promise<MintOnChainResponse> {
	const chainId = await ethereum.getChainId()
	const evmOwner = await ethereum.getFrom()
	const owner = createUnionAddressWithChainId(chainId, evmOwner)
	const erc721Contract = await getErc721Contract(ethereum, ERC721VersionEnum.ERC721V1, data.collection.id)
	const nftTokenId = await getTokenId(nftCollectionApi, data.collection.id, owner, data.nftTokenId)
	const { tokenId, signature: { v, r, s } } = nftTokenId

	const uriPrefix = await erc721Contract.functionCall("tokenURIPrefix").call()
	const uri = sanitizeUri(uriPrefix, data.uri)
	const transaction = await send(erc721Contract.functionCall("mint", tokenId, v, r, s, uri))

	return createMintOnChainResponse({
		transaction,
		tokenId,
		contract: data.collection.id,
		owner,
		itemId: createUnionItemIdWithCollectionId(data.collection.id, tokenId),
	})
}

export async function mintErc721v2(
	ethereum: Ethereum,
	send: SendFunction,
	nftCollectionApi: ApiClient.CollectionControllerApi,
	data: ERC721RequestV2
): Promise<MintOnChainResponse> {
	const chainId = await ethereum.getChainId()
	const evmOwner = await ethereum.getFrom()
	const owner = createUnionAddressWithChainId(chainId, evmOwner)
	const erc721Contract = await getErc721Contract(ethereum, ERC721VersionEnum.ERC721V2, data.collection.id)
	const nftTokenId = await getTokenId(nftCollectionApi, data.collection.id, owner, data.nftTokenId)
	const { tokenId, signature: { v, r, s } } = nftTokenId
	const royalties = getRoyalties(data.royalties)

	const uriPrefix = await erc721Contract.functionCall("tokenURIPrefix").call()
	const uri = sanitizeUri(uriPrefix, data.uri)
	const transaction = await send(erc721Contract.functionCall("mint", tokenId, v, r, s, royalties, uri))

	return createMintOnChainResponse({
		transaction,
		tokenId,
		contract: data.collection.id,
		owner,
		itemId: createUnionItemIdWithCollectionId(data.collection.id, tokenId),
	})
}

export async function mintErc721v3(
	ethereum: Ethereum,
	send: SendFunction,
	nftCollectionApi: ApiClient.CollectionControllerApi,
	data: ERC721RequestV3
): Promise<MintOnChainResponse> {
	const creators = await getCreators(data, ethereum)
	const evmOwner = creators[0].account
	const owner = createUnionAddressWithChainId(await ethereum.getChainId(), evmOwner)
	const erc721Contract = await getErc721Contract(ethereum, ERC721VersionEnum.ERC721V3, data.collection.id)
	const uriPrefix = await erc721Contract.functionCall("baseURI").call()
	const uri = sanitizeUri(uriPrefix, data.uri)
	const { tokenId } = await getTokenId(nftCollectionApi, data.collection.id, owner, data.nftTokenId)

	const args = {
		tokenId,
		tokenURI: uri,
		creators,
		royalties: getRoyalties(data.royalties),
		signatures: ["0x"],
	}

	const transaction = await send(
		erc721Contract.functionCall("mintAndTransfer", args, evmOwner)
	)
	return createMintOnChainResponse({
		transaction,
		tokenId,
		contract: data.collection.id,
		owner,
		itemId: createUnionItemIdWithCollectionId(data.collection.id, tokenId),
	})
}

export async function mintErc1155v1(
	ethereum: Ethereum,
	send: SendFunction,
	nftCollectionApi: ApiClient.CollectionControllerApi,
	data: ERC1155RequestV1
): Promise<MintOnChainResponse> {
	const chainId = await ethereum.getChainId()
	const evmOwner = await ethereum.getFrom()
	const owner = createUnionAddressWithChainId(chainId, evmOwner)
	const erc155Contract = await getErc1155Contract(ethereum, ERC1155VersionEnum.ERC1155V1, data.collection.id)
	const nftTokenId = await getTokenId(nftCollectionApi, data.collection.id, owner, data.nftTokenId)
	const { tokenId, signature: { v, r, s } } = nftTokenId
	const royalties = getRoyalties(data.royalties)

	const uriPrefix = await erc155Contract.functionCall("tokenURIPrefix").call()
	const uri = sanitizeUri(uriPrefix, data.uri)
	const transaction = await send(
		erc155Contract.functionCall("mint", tokenId, v, r, s, royalties, data.supply, uri)
	)

	return createMintOnChainResponse({
		transaction,
		tokenId,
		contract: data.collection.id,
		owner,
		itemId: createUnionItemIdWithCollectionId(data.collection.id, tokenId),
	})
}

export async function mintErc1155v2(
	ethereum: Ethereum,
	send: SendFunction,
	nftCollectionApi: ApiClient.CollectionControllerApi,
	data: ERC1155RequestV2
): Promise<MintOnChainResponse> {
	const creators = await getCreators(data, ethereum)
	const evmOwner = creators[0].account
	const owner = createUnionAddressWithChainId(await ethereum.getChainId(), evmOwner)
	const erc1155Contract = await getErc1155Contract(ethereum, ERC1155VersionEnum.ERC1155V2, data.collection.id)
	const { tokenId } = await getTokenId(nftCollectionApi, data.collection.id, owner, data.nftTokenId)
	const uriPrefix = await erc1155Contract.functionCall("baseURI").call()
	const uri = sanitizeUri(uriPrefix, data.uri)

	const args = {
		tokenId,
		tokenURI: uri,
		supply: data.supply,
		creators: creators,
		royalties: getRoyalties(data.royalties),
		signatures: ["0x"],
	}
	const transaction = await send(
		erc1155Contract.functionCall("mintAndTransfer", args, evmOwner, data.supply)
	)
	return createMintOnChainResponse({
		transaction,
		tokenId,
		contract: data.collection.id,
		owner,
		itemId: createUnionItemIdWithCollectionId(data.collection.id, tokenId),
	})
}

export async function getCreators(
	data: ERC1155RequestV2 | ERC721RequestV3, ethereum: Ethereum
): Promise<Array<{account: Address, value: number}>> {
	if (data.creators && data.creators.length > 0) {
		return data.creators.map(creator => ({
			account: convertToEVMAddress(creator.account),
			value: creator.value,
		}))
	}
	const account = toAddress(await ethereum.getFrom())
	return [{
		account,
		value: 10000,
	}]
}

export function getRoyalties(royalties: ApiClient.Royalty[] | undefined): Array<{recipient: Address, value: number}> {
	return (royalties || [])
		.map((x) => ({
			recipient: convertToEVMAddress(x.account),
			value: x.value,
		}))
}

function createMintOnChainResponse(props: Omit<MintOnChainResponse, "type">): MintOnChainResponse {
	return {
		type: MintResponseTypeEnum.ON_CHAIN,
		...props,
	}
}
