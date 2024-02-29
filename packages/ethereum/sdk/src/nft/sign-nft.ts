import type { Binary, EIP712Domain, LazyErc1155, LazyErc721 } from "@rarible/ethereum-api-client"
import type { Address } from "@rarible/types"
import { toBinary } from "@rarible/types"
import type { Ethereum } from "@rarible/ethereum-provider"
import type { TypedMessage } from "eth-sig-util"
import type { Maybe } from "@rarible/types/build/maybe"
import type { GetConfigByChainId } from "../config"
import { getRequiredWallet } from "../common/get-required-wallet"
import {
	EIP1155_DOMAIN_NFT_TEMPLATE,
	EIP1155_NFT_TYPE,
	EIP1155_NFT_TYPES,
	EIP721_DOMAIN_NFT_TEMPLATE,
	EIP721_NFT_TYPE,
	EIP721_NFT_TYPES,
} from "./eip712"

type LazyErc721Signless = Omit<LazyErc721, "signatures">
type LazyErc1155Signless = Omit<LazyErc1155, "signatures">
export type LazyNftSignless = LazyErc721Signless | LazyErc1155Signless

export async function signNft(
	ethereum: Maybe<Ethereum>,
	getConfig: GetConfigByChainId,
	nft: LazyNftSignless
): Promise<Binary> {
	const wallet = getRequiredWallet(ethereum)
	const config = await getConfig()
	switch (nft["@type"]) {
		case "ERC721": {
			const domain = createEIP712NftDomain(config.chainId, nft.contract, "ERC721")

			const data: TypedMessage<typeof EIP721_NFT_TYPES> = {
				types: EIP721_NFT_TYPES,
				domain,
				primaryType: EIP721_NFT_TYPE,
				message: {
					...nft,
					tokenURI: nft.uri,
				},
			}
			const signedData = await wallet.signTypedData(data)
			if (!signedData) {
				throw new Error(`signNft error: signedData is empty (${signedData}), data=${JSON.stringify(data)}`)
			}
			return toBinary(signedData)
		}
		case "ERC1155": {
			const domain = createEIP712NftDomain(config.chainId, nft.contract, "ERC1155")

			const data: TypedMessage<typeof EIP1155_NFT_TYPES> = {
				types: EIP1155_NFT_TYPES,
				domain,
				primaryType: EIP1155_NFT_TYPE,
				message: {
					...nft,
					tokenURI: nft.uri,
				},
			}
			const signedData = await wallet.signTypedData(data)
			if (!signedData) {
				throw new Error(`signNft error: signedData=${signedData}, data=${JSON.stringify(data)}`)
			}
			return toBinary(signedData)
		}
		default:
			throw new Error(`Unexpected nft type - ${nft["@type"]}`)
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
		default:
			throw new Error(`Unexpected nft type ${nftType}`)
	}
}
