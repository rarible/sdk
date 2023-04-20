import type { Address, NftCollection, NftItem, BigNumber, NftTokenId, Part } from "@rarible/ethereum-api-client"
import { NftCollectionFeatures, NftCollectionType } from "@rarible/ethereum-api-client"
import type { EthereumTransaction } from "@rarible/ethereum-provider"
import type { NFTContractVersion } from "../nft/contracts/domain"
import { ERC1155VersionEnum, ERC721VersionEnum } from "../nft/contracts/domain"

export type CommonNftCollection = Omit<NftCollection, "supportsLazyMint"> & Partial<NftCollection>

export function createErc721V2Collection(
	address: Address
): CommonNftCollection & { version: ERC721VersionEnum.ERC721V2 } {
	return {
		features: [NftCollectionFeatures.SECONDARY_SALE_FEES],
		id: address,
		name: "Test-collection",
		type: NftCollectionType.ERC721,
		version: ERC721VersionEnum.ERC721V2,
	}
}

export function createErc721V3Collection(
	address: Address
): CommonNftCollection & { version: ERC721VersionEnum.ERC721V3 } {
	return {
		features: [NftCollectionFeatures.SECONDARY_SALE_FEES, NftCollectionFeatures.MINT_AND_TRANSFER],
		id: address,
		name: "Test-collection",
		type: NftCollectionType.ERC721,
		version: ERC721VersionEnum.ERC721V3,
	}
}

export function createErc721V1Collection(
	address: Address
): CommonNftCollection & { version: ERC721VersionEnum.ERC721V1 } {
	return {
		features: [],
		id: address,
		name: "Test-collection",
		type: NftCollectionType.ERC721,
		version: ERC721VersionEnum.ERC721V1,
	}
}

export function createErc1155V1Collection(
	address: Address
): CommonNftCollection & { version: ERC1155VersionEnum.ERC1155V1 } {
	return {
		features: [NftCollectionFeatures.SECONDARY_SALE_FEES],
		id: address,
		name: "Test-collection",
		type: NftCollectionType.ERC1155,
		version: ERC1155VersionEnum.ERC1155V1,
	}
}

export function createErc1155V2Collection(
	address: Address
): CommonNftCollection & { version: ERC1155VersionEnum.ERC1155V2 } {
	return {
		features: [NftCollectionFeatures.MINT_AND_TRANSFER],
		id: address,
		name: "Test-collection",
		type: NftCollectionType.ERC1155,
		version: ERC1155VersionEnum.ERC1155V2,
	}
}

export type MintResponseCommon = {
	contract: Address
	tokenId: BigNumber
	owner: Address
	itemId: string
}

export enum MintResponseTypeEnum {
	OFF_CHAIN = "off-chain",
	ON_CHAIN = "on-chain"
}

export type MintOffChainResponse = MintResponseCommon & {
	type: MintResponseTypeEnum.OFF_CHAIN
	item: NftItem
}

export type MintOnChainResponse = MintResponseCommon & {
	type: MintResponseTypeEnum.ON_CHAIN
	transaction: EthereumTransaction
}


type CommonMintRequest = {
	uri: string
	nftTokenId?: NftTokenId
}

export type ERC721RequestV1 = {
	collection: ERC721CollectionV1
} & CommonMintRequest

export type ERC721RequestV2 = {
	collection: ERC721CollectionV2
	royalties?: Array<Part>
} & CommonMintRequest

export type ERC721RequestV3 = {
	collection: ERC721CollectionV3
	lazy: boolean
	creators?: Array<Part>
	royalties?: Array<Part>
} & CommonMintRequest

export type ERC1155RequestV1 = {
	collection: ERC1155CollectionV1
	supply: number
	royalties?: Array<Part>
} & CommonMintRequest

export type ERC1155RequestV2 = {
	collection: ERC1155CollectionV2
	supply: number
	lazy: boolean
	creators?: Array<Part>
	royalties?: Array<Part>
} & CommonMintRequest

export type Collection<V extends NFTContractVersion> = CommonNftCollection & { version: V }
export type ERC721CollectionV1 = Collection<ERC721VersionEnum.ERC721V1>
export type ERC721CollectionV2 = Collection<ERC721VersionEnum.ERC721V2>
export type ERC721CollectionV3 = Collection<ERC721VersionEnum.ERC721V3>
export type ERC1155CollectionV1 = Collection<ERC1155VersionEnum.ERC1155V1>
export type ERC1155CollectionV2 = Collection<ERC1155VersionEnum.ERC1155V2>

export type MintRequestERC721 = ERC721RequestV1 | ERC721RequestV2 | ERC721RequestV3
export type MintRequestERC1155 = ERC1155RequestV1 | ERC1155RequestV2
export type MintRequest = MintRequestERC721 | MintRequestERC1155
