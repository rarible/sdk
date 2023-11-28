import type { Ethereum, EthereumContract } from "@rarible/ethereum-provider/build"
import type { CollectionId } from "@rarible/api-client"
import { convertToEVMAddress } from "@rarible/sdk-common"
import { ERC721VersionEnum } from "../domain"

export async function getErc721Contract(
	ethereum: Ethereum, version: ERC721VersionEnum, collectionId: CollectionId
): Promise<EthereumContract> {
	const address = convertToEVMAddress(collectionId)
	switch (version) {
		case ERC721VersionEnum.ERC721V3: {
			const { erc721v3Abi } = await import("./v3")
			return ethereum.createContract(erc721v3Abi, address)
		}
		case ERC721VersionEnum.ERC721V2: {
			const { erc721v2Abi } = await import("./v2")
			return ethereum.createContract(erc721v2Abi, address)
		}
		case ERC721VersionEnum.ERC721V1: {
			const { erc721v1Abi } = await import("./v1")
			return ethereum.createContract(erc721v1Abi, address)
		}
		default: throw new Error("Unsupported ERC721 version")
	}
}
