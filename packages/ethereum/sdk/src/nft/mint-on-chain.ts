import type { Ethereum } from "@rarible/ethereum-provider"
import type { NftCollectionControllerApi, Part } from "@rarible/ethereum-api-client"
import { toEVMAddress } from "@rarible/types"
import type { SendFunction } from "../common/send-transaction"
import { createItemId } from "../common/create-item-id"
import { sanitizeUri } from "../common/sanitize-uri"
import type {
  ERC1155RequestV1,
  ERC1155RequestV2,
  ERC721RequestV1,
  ERC721RequestV2,
  ERC721RequestV3,
  MintOnChainResponse,
} from "./mint"
import { MintResponseTypeEnum } from "./mint"
import { getTokenId } from "./get-token-id"
import { getErc721Contract } from "./contracts/erc721"
import { ERC1155VersionEnum, ERC721VersionEnum } from "./contracts/domain"
import { getErc1155Contract } from "./contracts/erc1155"

export async function mintErc721v1(
  ethereum: Ethereum,
  send: SendFunction,
  nftCollectionApi: NftCollectionControllerApi,
  data: ERC721RequestV1,
): Promise<MintOnChainResponse> {
  const owner = toEVMAddress(await ethereum.getFrom())
  const erc721Contract = await getErc721Contract(ethereum, ERC721VersionEnum.ERC721V1, data.collection.id)
  const nftTokenId = await getTokenId(nftCollectionApi, data.collection.id, owner, data.nftTokenId)
  const {
    tokenId,
    signature: { v, r, s },
  } = nftTokenId

  const uriPrefix = await erc721Contract.functionCall("tokenURIPrefix").call()
  const uri = sanitizeUri(uriPrefix, data.uri)
  const transaction = await send(erc721Contract.functionCall("mint", tokenId, v, r, s, uri))

  return createMintOnChainResponse({
    transaction,
    tokenId,
    contract: data.collection.id,
    owner,
    itemId: createItemId(data.collection.id, tokenId),
  })
}

export async function mintErc721v2(
  ethereum: Ethereum,
  send: SendFunction,
  nftCollectionApi: NftCollectionControllerApi,
  data: ERC721RequestV2,
): Promise<MintOnChainResponse> {
  const owner = toEVMAddress(await ethereum.getFrom())
  const erc721Contract = await getErc721Contract(ethereum, ERC721VersionEnum.ERC721V2, data.collection.id)
  const nftTokenId = await getTokenId(nftCollectionApi, data.collection.id, owner, data.nftTokenId)
  const {
    tokenId,
    signature: { v, r, s },
  } = nftTokenId
  const royalties = (data.royalties || []).map(x => ({ recipient: x.account, value: x.value }))

  const uriPrefix = await erc721Contract.functionCall("tokenURIPrefix").call()
  const uri = sanitizeUri(uriPrefix, data.uri)
  const transaction = await send(erc721Contract.functionCall("mint", tokenId, v, r, s, royalties, uri))

  return createMintOnChainResponse({
    transaction,
    tokenId,
    contract: data.collection.id,
    owner,
    itemId: createItemId(data.collection.id, tokenId),
  })
}

export async function mintErc721v3(
  ethereum: Ethereum,
  send: SendFunction,
  nftCollectionApi: NftCollectionControllerApi,
  data: ERC721RequestV3,
): Promise<MintOnChainResponse> {
  const creators = await getCreators(data, ethereum)
  const owner = creators[0].account
  const erc721Contract = await getErc721Contract(ethereum, ERC721VersionEnum.ERC721V3, data.collection.id)
  const uriPrefix = await erc721Contract.functionCall("baseURI").call()
  const uri = sanitizeUri(uriPrefix, data.uri)
  const { tokenId } = await getTokenId(nftCollectionApi, data.collection.id, owner, data.nftTokenId)

  const args = {
    tokenId,
    tokenURI: uri,
    creators,
    royalties: data.royalties || [],
    signatures: ["0x"],
  }

  const transaction = await send(erc721Contract.functionCall("mintAndTransfer", args, owner))
  return createMintOnChainResponse({
    transaction,
    tokenId,
    contract: data.collection.id,
    owner,
    itemId: createItemId(data.collection.id, tokenId),
  })
}

export async function mintErc1155v1(
  ethereum: Ethereum,
  send: SendFunction,
  nftCollectionApi: NftCollectionControllerApi,
  data: ERC1155RequestV1,
): Promise<MintOnChainResponse> {
  const owner = toEVMAddress(await ethereum.getFrom())
  const erc155Contract = await getErc1155Contract(ethereum, ERC1155VersionEnum.ERC1155V1, data.collection.id)
  const nftTokenId = await getTokenId(nftCollectionApi, data.collection.id, owner, data.nftTokenId)
  const {
    tokenId,
    signature: { v, r, s },
  } = nftTokenId
  const royalties = (data.royalties || []).map(x => ({ recipient: x.account, value: x.value }))

  const uriPrefix = await erc155Contract.functionCall("tokenURIPrefix").call()
  const uri = sanitizeUri(uriPrefix, data.uri)
  const transaction = await send(erc155Contract.functionCall("mint", tokenId, v, r, s, royalties, data.supply, uri))

  return createMintOnChainResponse({
    transaction,
    tokenId,
    contract: data.collection.id,
    owner,
    itemId: createItemId(data.collection.id, tokenId),
  })
}

export async function mintErc1155v2(
  ethereum: Ethereum,
  send: SendFunction,
  nftCollectionApi: NftCollectionControllerApi,
  data: ERC1155RequestV2,
): Promise<MintOnChainResponse> {
  const creators = await getCreators(data, ethereum)
  const owner = creators[0].account
  const erc1155Contract = await getErc1155Contract(ethereum, ERC1155VersionEnum.ERC1155V2, data.collection.id)
  const { tokenId } = await getTokenId(nftCollectionApi, data.collection.id, owner, data.nftTokenId)
  const uriPrefix = await erc1155Contract.functionCall("baseURI").call()
  const uri = sanitizeUri(uriPrefix, data.uri)

  const args = {
    tokenId,
    tokenURI: uri,
    supply: data.supply,
    creators: creators,
    royalties: data.royalties || [],
    signatures: ["0x"],
  }
  const transaction = await send(erc1155Contract.functionCall("mintAndTransfer", args, owner, data.supply))
  return createMintOnChainResponse({
    transaction,
    tokenId,
    contract: data.collection.id,
    owner,
    itemId: createItemId(data.collection.id, tokenId),
  })
}

export async function getCreators(data: ERC1155RequestV2 | ERC721RequestV3, ethereum: Ethereum): Promise<Part[]> {
  if (data.creators && data.creators.length > 0) {
    return data.creators
  }
  const account = toEVMAddress(await ethereum.getFrom())
  return [
    {
      account,
      value: 10000,
    },
  ]
}

function createMintOnChainResponse(props: Omit<MintOnChainResponse, "type">): MintOnChainResponse {
  return {
    type: MintResponseTypeEnum.ON_CHAIN,
    ...props,
  }
}
