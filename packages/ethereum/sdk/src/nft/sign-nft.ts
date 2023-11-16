import type { Binary, EIP712Domain } from "@rarible/ethereum-api-client"
import type { Address } from "@rarible/types"
import { toBinary } from "@rarible/types"
import type { Ethereum } from "@rarible/ethereum-provider"
import type { TypedMessage } from "eth-sig-util"
import type { Maybe } from "@rarible/types/build/maybe"
import type { EthLazyItemErc1155, EthLazyItemErc721 } from "@rarible/api-client/build/models/LazyItem"
import { getEVMItemIdData } from "@rarible/sdk-common"
import {
	EIP1155_DOMAIN_NFT_TEMPLATE,
	EIP1155_NFT_TYPE,
	EIP1155_NFT_TYPES,
	EIP721_DOMAIN_NFT_TEMPLATE,
	EIP721_NFT_TYPE,
	EIP721_NFT_TYPES,
} from "./eip712"

// export type SimpleLazyNft<K extends keyof any> = LazyItem
export type SimpleLazyNft<K extends keyof any> = Omit<EthLazyItemErc721, K> | Omit<EthLazyItemErc1155, K>

export async function signNft(ethereum: Maybe<Ethereum>, chainId: number, nft: SimpleLazyNft<"signatures">): Promise<Binary> {
	if (!ethereum) {
		throw new Error("Wallet undefined")
	}
	switch (nft["@type"]) {
		case "ETH_ERC721": {
			const domain = createEIP712NftDomain(chainId, getEVMItemIdData(nft.id).contract, "ERC721")

			const data: TypedMessage<typeof EIP721_NFT_TYPES> = {
				types: EIP721_NFT_TYPES,
				domain,
				primaryType: EIP721_NFT_TYPE,
				message: {
					...nft,
					tokenURI: nft.uri,
				},
			}
			const signedData = await ethereum.signTypedData(data)
			if (!signedData) {
				throw new Error(`signNft error: signedData is empty (${signedData}), data=${JSON.stringify(data)}`)
			}
			return toBinary(signedData)
		}
		case "ETH_ERC1155": {
			const domain = createEIP712NftDomain(chainId, getEVMItemIdData(nft.id).contract, "ERC1155")

			const data: TypedMessage<typeof EIP1155_NFT_TYPES> = {
				types: EIP1155_NFT_TYPES,
				domain,
				primaryType: EIP1155_NFT_TYPE,
				message: {
					...nft,
					tokenURI: nft.uri,
				},
			}
			const signedData = await ethereum.signTypedData(data)
			if (!signedData) {
				throw new Error(`signNft error: signedData=${signedData}, data=${JSON.stringify(data)}`)
			}
			return toBinary(signedData)
		}
		default: {
			throw new Error("Unexpected")
		}
	}
}

function createEIP712NftDomain(
	chainId: number,
	verifyingContract: Address,
	nftType: "ERC721" | "ERC1155"
): EIP712Domain {
	switch (nftType) {
		case "ERC721": {
			return {
				...EIP721_DOMAIN_NFT_TEMPLATE,
				chainId,
				verifyingContract: verifyingContract,
			}
		}
		case "ERC1155": {
			return {
				...EIP1155_DOMAIN_NFT_TEMPLATE,
				chainId,
				verifyingContract: verifyingContract,
			}
		}
		default: {
			throw new Error("Unexpected")
		}
	}
}
