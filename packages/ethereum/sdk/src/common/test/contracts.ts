import type { Address } from "@rarible/ethereum-api-client"
import { getEthereumConfig } from "../../config"
import type { NFTContractVersion } from "../../nft/contracts/domain"
import { ERC1155VersionEnum, ERC721VersionEnum } from "../../nft/contracts/domain"
import type { EthereumNetwork } from "../../types"

export const publicNftContractTypes = [
	ERC721VersionEnum.ERC721V2,
	ERC721VersionEnum.ERC721V3,
	ERC1155VersionEnum.ERC1155V2,
] as const
export type PublicNftContractType = typeof publicNftContractTypes[number]

export function getPublicNftContract(network: EthereumNetwork, type: NFTContractVersion): Address {
	const { publicCollections } = getEthereumConfig(network)
	switch (type) {
		case ERC1155VersionEnum.ERC1155V2: return publicCollections.erc1155.v2
		case ERC721VersionEnum.ERC721V2: return publicCollections.erc721.v2
		case ERC721VersionEnum.ERC721V3: return publicCollections.erc721.v3
		default: throw new Error(`Unsupported test contract type: ${type}`)
	}
}