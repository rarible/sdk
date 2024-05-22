import type { NftCollection } from "@rarible/ethereum-api-client"
import { isErc1155v2Collection, isErc721v2Collection, isErc721v3Collection } from "./mint"

export type PrepareMintResponse = {
  multiple: boolean
  supportsRoyalties: boolean
  supportsLazyMint: boolean
}

export function isSupportsRoyalties(collection: NftCollection): boolean {
  if (collection.type === "ERC721") {
    return isErc721v3Collection(collection) || isErc721v2Collection(collection)
  } else if (collection.type === "ERC1155") {
    return true
  } else {
    throw new Error("Unrecognized collection type")
  }
}

export function isSupportsLazyMint(collection: NftCollection) {
  return isErc721v3Collection(collection) || isErc1155v2Collection(collection)
}

export function isMultiple(collection: NftCollection): boolean {
  return collection.type === "ERC1155"
}

export function prepareMintRequest(collection: NftCollection): PrepareMintResponse {
  return {
    multiple: isMultiple(collection),
    supportsRoyalties: isSupportsRoyalties(collection),
    supportsLazyMint: isSupportsLazyMint(collection),
  }
}
