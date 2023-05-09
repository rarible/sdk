import { toAddress, ZERO_ADDRESS } from "@rarible/types"
import { id32 } from "../common/id"
import type { EthereumConfig } from "./type"
import { FEE_CONFIG_URL } from "./common"

export const polygonConfig: EthereumConfig = {
	basePath: "https://polygon-api.rarible.org",
	chainId: 137,
	exchange: {
		v1: ZERO_ADDRESS,
		v2: toAddress("0x12b3897a36fDB436ddE2788C06Eff0ffD997066e"),
		openseaV1: ZERO_ADDRESS,
		wrapper: toAddress("0xf7DD32c761D61624dCAAe61d0d50Efc6E3E1F65c"),
		x2y2: ZERO_ADDRESS,
	},
	transferProxies: {
		nft: toAddress("0xd47e14DD9b98411754f722B4c4074e14752Ada7C"),
		erc20: toAddress("0x49b4e47079d9b733B2227fa15f0762dBF707B263"),
		erc721Lazy: toAddress("0xDD28328257a2Cce3204332C747Cc350153937A1D"),
		erc1155Lazy: toAddress("0x0E63021A7597B254484b7F99dDD9b319591350B6"),
		openseaV1: ZERO_ADDRESS,
		cryptoPunks: ZERO_ADDRESS,
	},
	feeConfigUrl: FEE_CONFIG_URL,
	openSea: {
		metadata: id32("RARIBLE"),
		proxyRegistry: ZERO_ADDRESS,
	},
	factories: {
		erc721: toAddress("0x16911a36a56f828f17632cD4915614Dd5c7a45e0"),
		erc1155: toAddress("0xF46e8e6fA0F048DdD76F8c6982eBD059796298B8"),
	},
	cryptoPunks: {
		marketContract: ZERO_ADDRESS,
		wrapperContract: ZERO_ADDRESS,
	},
	sudoswap: {
		pairFactory: ZERO_ADDRESS,
		pairRouter: ZERO_ADDRESS,
	},
	weth: toAddress("0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619"),
	auction: ZERO_ADDRESS,
}
