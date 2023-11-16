import type {
	Collection,
	UnionAddress,
} from "@rarible/api-client"
import {
	CollectionFeatures,
	CollectionType,
} from "@rarible/api-client"
import { toCollectionId } from "@rarible/types"
import { ERC1155VersionEnum, ERC721VersionEnum } from "../nft/contracts/domain"

export type CommonNftCollection = Omit<Collection, "supportsLazyMint"> & Partial<Collection>

export function createErc721V2Collection(
	address: UnionAddress
): CommonNftCollection & { version: ERC721VersionEnum.ERC721V2 } {
	return {
		features: [CollectionFeatures.SECONDARY_SALE_FEES],
		id: toCollectionId(address),
		name: "Test-collection",
		type: CollectionType.ERC721,
		version: ERC721VersionEnum.ERC721V2,
	}
}

export function createErc721V3Collection(
	address: UnionAddress
): CommonNftCollection & { version: ERC721VersionEnum.ERC721V3 } {
	return {
		features: [CollectionFeatures.SECONDARY_SALE_FEES, CollectionFeatures.MINT_AND_TRANSFER],
		id: address,
		name: "Test-collection",
		type: CollectionType.ERC721,
		version: ERC721VersionEnum.ERC721V3,
	}
}

export function createErc721V1Collection(
	address: UnionAddress
): CommonNftCollection & { version: ERC721VersionEnum.ERC721V1 } {
	return {
		features: [],
		id: address,
		name: "Test-collection",
		type: CollectionType.ERC721,
		version: ERC721VersionEnum.ERC721V1,
	}
}

export function createErc1155V1Collection(
	address: UnionAddress
): CommonNftCollection & { version: ERC1155VersionEnum.ERC1155V1 } {
	return {
		features: [CollectionFeatures.SECONDARY_SALE_FEES],
		id: address,
		name: "Test-collection",
		type: CollectionType.ERC1155,
		version: ERC1155VersionEnum.ERC1155V1,
	}
}

export function createErc1155V2Collection(
	address: UnionAddress
): CommonNftCollection & { version: ERC1155VersionEnum.ERC1155V2 } {
	return {
		features: [CollectionFeatures.MINT_AND_TRANSFER],
		id: address,
		name: "Test-collection",
		type: CollectionType.ERC1155,
		version: ERC1155VersionEnum.ERC1155V2,
	}
}
