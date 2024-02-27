import { toAddress, ZERO_ADDRESS } from "@rarible/types"
import { id32 } from "../common/id"
import type { EthereumConfig } from "./type"
import { FEE_CONFIG_URL } from "./common"

export const celoTestnetConfig: EthereumConfig = {
	//@todo insert
	basePath: "",
	chainId: 44787,
	exchange: {
		v1: ZERO_ADDRESS,
		v2: toAddress("0xB4D34a10921347877B0AA7A9DB347871b20b19F5"),
		openseaV1: ZERO_ADDRESS,
		wrapper: toAddress("0x7D63585bEF6FA1D49d70558FF0616C99480FFA0F"),
		looksrare: ZERO_ADDRESS,
		looksrareV2: ZERO_ADDRESS,
		x2y2: ZERO_ADDRESS,
	},
	transferProxies: {
		nft: toAddress("0xf1dCB818F494Fb63358510b6d05Cc50096B8F06c"),
		erc20: toAddress("0xB02f8F8F3527e5b2C7dB72B7eE1Af244fA8B3BAE"),
		erc721Lazy: toAddress("0xE3Baf1b17335bbf3AC3C2cFCe95eC1bfC463d0c8"),
		erc1155Lazy: toAddress("0x7Eabe83e0F99B6bf24Ec3F50994B972DC38D11dF"),
		openseaV1: ZERO_ADDRESS,
		cryptoPunks: ZERO_ADDRESS,
	},
	feeConfigUrl: FEE_CONFIG_URL,
	openSea: {
		metadata: id32("RARIBLE"),
		proxyRegistry: ZERO_ADDRESS,
		merkleValidator: ZERO_ADDRESS,
	},
	factories: {
		erc721: toAddress("0x48838abEAE900a2FC9fC4eC95a47F29a6c1B7647"),
		erc1155: toAddress("0xC1e685AF493CcC473F22664151947CDA56Fae0A1"),
	},
	cryptoPunks: {
		marketContract: ZERO_ADDRESS,
		wrapperContract: ZERO_ADDRESS,
	},
	sudoswap: {
		pairFactory: ZERO_ADDRESS,
		pairRouter: ZERO_ADDRESS,
	},
	weth: ZERO_ADDRESS,
	auction: ZERO_ADDRESS,
}
