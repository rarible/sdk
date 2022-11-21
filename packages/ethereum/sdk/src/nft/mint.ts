import type {
	Address,
	BigNumber,
	Binary,
	NftCollectionControllerApi,
	NftItem,
	NftLazyMintControllerApi,
	NftTokenId,
	Part,
} from "@rarible/ethereum-api-client"
import { NftCollectionFeatures } from "@rarible/ethereum-api-client"
import type { Maybe } from "@rarible/types/build/maybe"
import type { Ethereum, EthereumTransaction } from "@rarible/ethereum-provider"
import type { SendFunction } from "../common/send-transaction"
import type { CommonNftCollection } from "../common/mint"
import { mintOffChain } from "./mint-off-chain"
import { mintErc1155v1, mintErc1155v2, mintErc721v1, mintErc721v2, mintErc721v3 } from "./mint-on-chain"
import type { SimpleLazyNft } from "./sign-nft"
import type { ERC1155VersionEnum, ERC721VersionEnum, NFTContractVersion } from "./contracts/domain"

type Collection<V extends NFTContractVersion> = CommonNftCollection & { version: V }
type ERC721CollectionV1 = Collection<ERC721VersionEnum.ERC721V1>
type ERC721CollectionV2 = Collection<ERC721VersionEnum.ERC721V2>
type ERC721CollectionV3 = Collection<ERC721VersionEnum.ERC721V3>
type ERC1155CollectionV1 = Collection<ERC1155VersionEnum.ERC1155V1>
type ERC1155CollectionV2 = Collection<ERC1155VersionEnum.ERC1155V2>

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

export type MintRequestERC721 = ERC721RequestV1 | ERC721RequestV2 | ERC721RequestV3
export type MintRequestERC1155 = ERC1155RequestV1 | ERC1155RequestV2
export type MintRequest = MintRequestERC721 | MintRequestERC1155

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

export async function mint(
	ethereum: Maybe<Ethereum>,
	send: SendFunction,
	signNft: (nft: SimpleLazyNft<"signatures">) => Promise<Binary>,
	nftCollectionApi: NftCollectionControllerApi,
	nftLazyMintApi: NftLazyMintControllerApi,
	checkWalletChainId: () => Promise<boolean>,
	data: MintRequest
): Promise<MintOffChainResponse | MintOnChainResponse> {
	await checkWalletChainId()
	if (!ethereum) {
		throw new Error("Wallet undefined")
	}
	if (isERC1155Request(data)) {
		if (isERC1155v2Request(data)) {
			if (data.lazy) return mintOffChain(ethereum, signNft, nftCollectionApi, nftLazyMintApi, data)
			return mintErc1155v2(ethereum, send, nftCollectionApi, data)
		}
		return mintErc1155v1(ethereum, send, nftCollectionApi, data)
	}
	if (isERC721Request(data)) {
		if (isERC721v3Request(data)) {
			if (data.lazy) return mintOffChain(ethereum, signNft, nftCollectionApi, nftLazyMintApi, data)
			return mintErc721v3(ethereum, send, nftCollectionApi, data)
		}
		if (isERC721v2Request(data)) {
			return mintErc721v2(ethereum, send, nftCollectionApi, data)
		}
		return mintErc721v1(ethereum, send, nftCollectionApi, data)
	}
	throw new Error("Unsupported collection")
}

const isERC721v2Request = (data: MintRequest): data is ERC721RequestV2 => isErc721v2Collection(data.collection)
const isERC721v3Request = (data: MintRequest): data is ERC721RequestV3 => isErc721v3Collection(data.collection)
const isERC1155v2Request = (data: MintRequest): data is ERC1155RequestV2 => isErc1155v2Collection(data.collection)
const isERC1155Request = (data: MintRequest): data is ERC1155RequestV1 | ERC1155RequestV2 =>
	data.collection.type === "ERC1155"
const isERC721Request = (data: MintRequest): data is ERC721RequestV1 | ERC721RequestV2 | ERC721RequestV3 =>
	data.collection.type === "ERC721"

export const isErc721v3Collection = (x: CommonNftCollection): x is ERC721CollectionV3 =>
	x.features.indexOf(NftCollectionFeatures.MINT_AND_TRANSFER) !== -1 && x.type === "ERC721"
export const isErc721v2Collection = (x: CommonNftCollection): x is ERC721CollectionV2 =>
	x.features.indexOf(NftCollectionFeatures.SECONDARY_SALE_FEES) !== -1 && x.type === "ERC721"
export const isErc721v1Collection = (x: CommonNftCollection): x is ERC721CollectionV1 =>
	!isErc721v3Collection(x) && !isErc721v2Collection(x) && x.type === "ERC721"

export const isErc1155v2Collection = (x: CommonNftCollection): x is ERC1155CollectionV2 =>
	x.features.indexOf(NftCollectionFeatures.MINT_AND_TRANSFER) !== -1 && x.type === "ERC1155"
export const isErc1155v1Collection = (x: CommonNftCollection): x is ERC1155CollectionV1 =>
	!isErc1155v2Collection(x) && x.type === "ERC1155"
