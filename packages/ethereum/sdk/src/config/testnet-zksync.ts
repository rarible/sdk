import { toAddress, ZERO_ADDRESS } from "@rarible/types"
import { id32 } from "../common/id"
import type { EthereumConfig } from "./type"
import { FEE_CONFIG_URL } from "./common"

export const zkSyncTestnetConfig: EthereumConfig = {
	basePath: "https://testnet-zksync-api.rarible.org",
	chainId: 300,
	exchange: {
		v1: ZERO_ADDRESS,
		v2: toAddress("0x99bD7BA01f9872f034a35DC4bC737cFaaaC11D63"),
		openseaV1: ZERO_ADDRESS,
		wrapper: toAddress("0x0148b11891C0E30Fb36a6D646E04C7bebE7969c8"),
		looksrare: ZERO_ADDRESS,
		looksrareV2: ZERO_ADDRESS,
		x2y2: ZERO_ADDRESS,
	},
	transferProxies: {
		nft: toAddress("0x85a26E6D52239817570Ff643bA09E3AA5393A805"),
		erc20: toAddress("0x43b9B5221F513031acC62dc8B9788E608B293baD"),
		erc721Lazy: toAddress("0x11983886da3c379E507A874649C96D7EEd086c32"),
		erc1155Lazy: toAddress("0x117c152C992e8c344Ce5a84100130cd87eF6bAE6"),
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
		erc721: ZERO_ADDRESS,
		erc1155: ZERO_ADDRESS,
	},
	cryptoPunks: {
		marketContract: ZERO_ADDRESS,
		wrapperContract: ZERO_ADDRESS,
	},
	sudoswap: {
		pairFactory: ZERO_ADDRESS,
		pairRouter: ZERO_ADDRESS,
	},
	weth: toAddress("0xdf09a97A1CF809C335616c21c3a0EA4780F96514"),
	auction: ZERO_ADDRESS,
	looksrareOrderValidatorV2: ZERO_ADDRESS,
}
