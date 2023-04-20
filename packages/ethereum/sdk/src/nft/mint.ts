import type {
	Binary,
	NftCollectionControllerApi,
	NftLazyMintControllerApi,
} from "@rarible/ethereum-api-client"
import { NftCollectionFeatures } from "@rarible/ethereum-api-client"
import type { Maybe } from "@rarible/types/build/maybe"
import type { Ethereum } from "@rarible/ethereum-provider"
import { Warning } from "@rarible/logger/build"
import type { SendFunction } from "../common/send-transaction"
import type {
	CommonNftCollection, ERC1155RequestV1, ERC1155RequestV2,
	ERC721RequestV2, ERC721RequestV3, ERC721CollectionV2,
	ERC721RequestV1, ERC721CollectionV1, ERC1155CollectionV2,
	ERC1155CollectionV1,
	MintOffChainResponse,
	MintOnChainResponse,
	MintRequest, ERC721CollectionV3,
} from "../common/mint"
import { mintOffChain } from "./mint-off-chain"
import { mintErc1155v1, mintErc1155v2, mintErc721v1, mintErc721v2, mintErc721v3 } from "./mint-on-chain"
import type { SimpleLazyNft } from "./sign-nft"

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
	if (data.uri === undefined) {
		throw new Warning("URI should be not undefined")
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
