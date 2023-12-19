import { toAddress, ZERO_ADDRESS } from "@rarible/types"
import { id32 } from "../common/id"
import type { EthereumConfig } from "./type"
import { FEE_CONFIG_URL } from "./common"

export const zkSyncConfig: EthereumConfig = {
	basePath: "https://zksyn-api.rarible.org",
	chainId: 324,
	exchange: {
		v1: ZERO_ADDRESS,
		v2: toAddress("0x5E0BbEd68e1b47C94a396226D8AC10DDe242e77c"),
		openseaV1: ZERO_ADDRESS,
		wrapper: toAddress("0xEf3b8F0B7EE374F5F79BE4D43E8cbB4A7952f274"),
		looksrare: ZERO_ADDRESS,
		looksrareV2: ZERO_ADDRESS,
		x2y2: ZERO_ADDRESS,
	},
	transferProxies: {
		nft: toAddress("0xaf63698293A4c7d235CCf6F809C348D641C0bd62"),
		erc20: toAddress("0xb5986bB35a6b53cb4764951Ad83cA12fa5a51C64"),
		erc721Lazy: toAddress("0x463651f1620E411426E7eB70c3D2029106F2B6E0"),
		erc1155Lazy: toAddress("0x99e3d07C2fA7d9566bAA34e84B9DD5b8fB98961a"),
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
		erc721: toAddress("0xB38F451e6Cc0Ad0e7a31C6Ec5648177Ba248eE9B"),
		erc1155: toAddress("0x196e1D96e73c805ee39C766435A81fb235510939"),
	},
	cryptoPunks: {
		marketContract: ZERO_ADDRESS,
		wrapperContract: ZERO_ADDRESS,
	},
	sudoswap: {
		pairFactory: ZERO_ADDRESS,
		pairRouter: ZERO_ADDRESS,
	},
	weth: toAddress("0x8Ebe4A94740515945ad826238Fc4D56c6B8b0e60"),
	auction: ZERO_ADDRESS,
	looksrareOrderValidatorV2: ZERO_ADDRESS,
}
