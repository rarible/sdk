import type { UnionAddress } from "@rarible/types"

export enum IPFSUploadProvider {
	PINATA = "pinata",
	IPFS_UPLOAD = "ipfs-upload",
	NFT_STORAGE = "nft-storage",
}

export type IPFSHash = string & {
	isIPFSHash: true
}

export type IPFSServiceResponse = {
	ipfsHash: IPFSHash
	size?: number
}

export type IPFSUploadResponse = {
	ipfsHash: IPFSHash
	pinSize?: number
}

export type NftStorageResponse = {
	value: {
		cid: IPFSHash
		size: number
	}
}

export type MintProperties = {
	name: string
	description?: string
	image?: File
	animationUrl?: File
	attributes: MintAttribute[]
}

export type MintAttribute = {
	key: string
	value: string
}

export type MetaUploadRequest = {
	nftStorageApiKey: string,
	properties: MintProperties,
	royalty: string,
	accountAddress: UnionAddress
}

export type UploadMetaResponse = {
	originalFile: File
	URL: string
	IPFSURL: IPFSHash
}

export type UploadedFolder = {
	hash: IPFSHash
	files: Record<string, UploadMetaResponse | undefined>
}
