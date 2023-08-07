import { ZERO_ADDRESS } from "@rarible/types"
import { id32 } from "../common/id"
import type { EthereumConfig } from "./type"
import { FEE_CONFIG_URL } from "./common"

export const mantleConfig: EthereumConfig = {
	basePath: "https://mantle-api.rarible.org",
	chainId: 5000,
	exchange: {
		v1: ZERO_ADDRESS,
		v2: ZERO_ADDRESS,
		openseaV1: ZERO_ADDRESS,
		wrapper: ZERO_ADDRESS,
		looksrare: ZERO_ADDRESS,
		looksrareV2: ZERO_ADDRESS,
		x2y2: ZERO_ADDRESS,
	},
	transferProxies: {
		nft: ZERO_ADDRESS,
		erc20: ZERO_ADDRESS,
		erc721Lazy: ZERO_ADDRESS,
		erc1155Lazy: ZERO_ADDRESS,
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
	weth: ZERO_ADDRESS,
	auction: ZERO_ADDRESS,
	looksrareOrderValidatorV2: ZERO_ADDRESS,
}
