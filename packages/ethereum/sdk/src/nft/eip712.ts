import type { MessageTypes } from "@rarible/ethereum-provider"

export const EIP721_NFT_TYPE = "Mint721"
export const NFT_DOMAIN_TYPE = [
	{ type: "string", name: "name" },
	{ type: "string", name: "version" },
	{ type: "uint256", name: "chainId" },
	{ type: "address", name: "verifyingContract" },
]
export const EIP721_NFT_TYPES: MessageTypes = {
	EIP712Domain: NFT_DOMAIN_TYPE,
	Part: [
		{ name: "account", type: "address" },
		{ name: "value", type: "uint96" },
	],
	Mint721: [
		{ name: "tokenId", type: "uint256" },
		{ name: "tokenURI", type: "string" },
		{ name: "creators", type: "Part[]" },
		{ name: "royalties", type: "Part[]" },
	],
}

export const EIP1155_NFT_TYPES: MessageTypes = {
	EIP712Domain: NFT_DOMAIN_TYPE,
	Part: [
		{ name: "account", type: "address" },
		{ name: "value", type: "uint96" },
	],
	Mint1155: [
		{ name: "tokenId", type: "uint256" },
		{ name: "supply", type: "uint256" },
		{ name: "tokenURI", type: "string" },
		{ name: "creators", type: "Part[]" },
		{ name: "royalties", type: "Part[]" },
	],
}

export const EIP721_DOMAIN_NFT_NAME = "Mint721"
export const EIP721_DOMAIN_NFT_VERSION = "1"
export const EIP721_DOMAIN_NFT_TEMPLATE = {
	name: EIP721_DOMAIN_NFT_NAME,
	version: EIP721_DOMAIN_NFT_VERSION,
}

export const EIP1155_NFT_TYPE = "Mint1155"
export const EIP1155_DOMAIN_NFT_NAME = "Mint1155"
export const EIP1155_DOMAIN_NFT_VERSION = "1"
export const EIP1155_DOMAIN_NFT_TEMPLATE = {
	name: EIP1155_DOMAIN_NFT_NAME,
	version: EIP1155_DOMAIN_NFT_VERSION,
}
