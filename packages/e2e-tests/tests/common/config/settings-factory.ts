import type { CreateCollectionRequestSimplified } from "@rarible/sdk/build/types/nft/deploy/simplified"
import { Blockchain } from "@rarible/api-client"

export const ERC_721_REQUEST = {
	blockchain: Blockchain.ETHEREUM,
	type: "ERC721",
	name: "erc721",
	symbol: "rari",
	baseURI: "https://ipfs.rarible.com",
	contractURI: "https://ipfs.rarible.com",
	isPublic: true,
} as CreateCollectionRequestSimplified

export const ERC_1155_REQUEST = {
	blockchain: Blockchain.ETHEREUM,
	type: "ERC1155",
	name: "name",
	symbol: "RARI",
	baseURI: "https://ipfs.rarible.com",
	contractURI: "https://ipfs.rarible.com",
	isPublic: true,
} as CreateCollectionRequestSimplified