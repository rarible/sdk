import type { Collection } from "@rarible/api-client"
import {
	isErc1155v2Collection,
	isErc721v2Collection,
	isErc721v3Collection,
} from "./mint"

export type PrepareMintResponse = {
	multiple: boolean
	supportsRoyalties: boolean
	supportsLazyMint: boolean
}

export function isSupportsRoyalties(collection: Collection): boolean {
	if (collection.type === "ERC721") {
		return isErc721v3Collection(collection) || isErc721v2Collection(collection)
	} else if (collection.type === "ERC1155") {
		return true
	} else {
		throw new Error("Unrecognized collection type")
	}
}

export function isSupportsLazyMint(collection: Collection) {
	return isErc721v3Collection(collection) || isErc1155v2Collection(collection)
}

export function isMultiple(collection: Collection): boolean {
	return collection.type === "ERC1155"
}

export function prepareMintRequest(collection: Collection): PrepareMintResponse {
	return {
		multiple: isMultiple(collection),
		supportsRoyalties: isSupportsRoyalties(collection),
		supportsLazyMint: isSupportsLazyMint(collection),
	}
}
