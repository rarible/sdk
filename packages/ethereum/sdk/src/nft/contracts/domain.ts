
export enum ERC721VersionEnum {
	ERC721V1 = "ERC721V1",
	ERC721V2 = "ERC721V2",
	ERC721V3 = "ERC721V3"
}

export enum ERC1155VersionEnum {
	ERC1155V1 = "ERC1155V1",
	ERC1155V2 = "ERC1155V2"
}

export type NFTContractVersion = ERC1155VersionEnum | ERC721VersionEnum