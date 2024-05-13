import { toAddress, ZERO_ADDRESS } from "@rarible/types"
import { Blockchain } from "@rarible/api-client"
import { id32 } from "../common/id"
import type { EthereumConfig } from "./type"
import { FEE_CONFIG_URL } from "./common"

export const arbitrumTestnetConfig: EthereumConfig = {
	basePath: "https://testnet-arbitrum-api.rarible.org",
	chainId: 421614,
	environment: "testnet",
	blockchain: Blockchain.ARBITRUM,
	exchange: {
		v1: ZERO_ADDRESS,
		v2: toAddress("0x47F6d59216aAdb2e5aA6bFAf0b06d790EdC35118"),
		openseaV1: ZERO_ADDRESS,
		wrapper: ZERO_ADDRESS,
		looksrare: ZERO_ADDRESS,
		looksrareV2: ZERO_ADDRESS,
		x2y2: ZERO_ADDRESS,
	},
	transferProxies: {
		nft: toAddress("0x3049455cdA17beE43d61090Ec344624aeda72Ed6"),
		erc20: toAddress("0x2FCE8435F0455eDc702199741411dbcD1B7606cA"),
		erc721Lazy: toAddress("0x41407B447Fb5425187A9BCA3a062644EF2410F8D"),
		erc1155Lazy: toAddress("0x18a2553ef1aaE12d9cd158821319e26A62feE90E"),
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
		erc721: toAddress("0xE3Baf1b17335bbf3AC3C2cFCe95eC1bfC463d0c8"),
		erc1155: toAddress("0x51929e5710D9cef0EB0388b7866dF20a4598dF26"),
	},
	cryptoPunks: {
		marketContract: ZERO_ADDRESS,
		wrapperContract: ZERO_ADDRESS,
	},
	sudoswap: {
		pairFactory: ZERO_ADDRESS,
		pairRouter: ZERO_ADDRESS,
	},
	weth: toAddress("0x980b62da83eff3d4576c647993b0c1d7faf17c73"),
	auction: ZERO_ADDRESS,
	looksrareOrderValidatorV2: ZERO_ADDRESS,
}
