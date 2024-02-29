import type * as EthereumApi from "@rarible/ethereum-api-client"
import { toBigNumber } from "@rarible/types"
import type { Ethereum } from "@rarible/ethereum-provider"
import type { Part } from "@rarible/ethereum-api-client"
import { sanitizeUri } from "../common/sanitize-uri"
import { getBlockchainFromChainId } from "../common"
import type { LazyNftSignless } from "./sign-nft"
import { getTokenId } from "./get-token-id"
import type { ERC1155RequestV2, ERC721RequestV3, MintOffChainResponse } from "./mint"
import { MintResponseTypeEnum } from "./mint"
import { getCreators } from "./mint-on-chain"
import { getErc721Contract } from "./contracts/erc721"
import { ERC1155VersionEnum, ERC721VersionEnum } from "./contracts/domain"
import { getErc1155Contract } from "./contracts/erc1155"

export async function mintOffChain(
	ethereum: Ethereum,
	signNft: (nft: LazyNftSignless) => Promise<EthereumApi.Binary>,
	nftCollectionApi: EthereumApi.NftCollectionControllerApi,
	nftLazyMintApi: EthereumApi.NftLazyMintControllerApi,
	data: ERC721RequestV3 | ERC1155RequestV2
): Promise<MintOffChainResponse> {
	if (getBlockchainFromChainId(await ethereum.getChainId()) === "POLYGON") {
		throw new Error("Off-chain mint not supported for Polygon")
	}

	const creators = await getCreators(data, ethereum)
	const { tokenId } = await getTokenId(nftCollectionApi, data.collection.id, creators[0].account, data.nftTokenId)

	const mintData = getMintOffChainData({
		...data,
		uri: await getRequestURI(ethereum, data),
	}, creators, tokenId)
	const minted = await nftLazyMintApi.mintNftAsset({
		lazyNft: Object.assign({}, mintData, {
			tokenId,
			signatures: [await signNft(mintData)],
		}),
	})
	return {
		type: MintResponseTypeEnum.OFF_CHAIN,
		item: minted,
		owner: creators[0].account,
		tokenId,
		contract: minted.contract,
		itemId: `${minted.contract}:${tokenId}`,
	}
}

function getMintOffChainData(
	data: ERC721RequestV3 | ERC1155RequestV2,
	creators: Part[],
	tokenId: EthereumApi.BigNumber
): LazyNftSignless {
	const base = {
		contract: data.collection.id,
		uri: data.uri,
		royalties: data.royalties || [],
		creators,
		tokenId,
	}
	if ("supply" in data) {
		return Object.assign({}, base, {
			"@type": "ERC1155" as const,
			supply: toBigNumber(data.supply.toString()),
		})
	}
	return Object.assign({}, base, {
		"@type": "ERC721" as const,
	})
}

export async function getRequestURI(ethereum: Ethereum, data: ERC721RequestV3 | ERC1155RequestV2): Promise<string> {
	if (data.collection.type === "ERC721") {
		const erc721Contract = await getErc721Contract(ethereum, ERC721VersionEnum.ERC721V3, data.collection.id)
		const uriPrefix = await erc721Contract.functionCall("baseURI").call()
		return sanitizeUri(uriPrefix, data.uri)
	} else if (data.collection.type === "ERC1155") {
		const erc1155Contract = await getErc1155Contract(ethereum, ERC1155VersionEnum.ERC1155V2, data.collection.id)
		const uriPrefix = await erc1155Contract.functionCall("baseURI").call()
		return sanitizeUri(uriPrefix, data.uri)
	}
	throw new Error("Wrong collection type")
}
