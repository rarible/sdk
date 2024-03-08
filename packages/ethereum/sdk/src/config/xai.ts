import { toAddress, ZERO_ADDRESS } from "@rarible/types"
import { id32 } from "../common/id"
import type { EthereumConfig } from "./type"
import { FEE_CONFIG_URL } from "./common"

export const xaiConfig: EthereumConfig = {
	basePath: "https://xai-api.rarible.org",
	chainId: 660279,
	environment: "production",
	exchange: {
		v1: ZERO_ADDRESS,
		v2: toAddress("0x5faf16A85028BE138A7178B222DeC98092FEEF97"),
		openseaV1: ZERO_ADDRESS,
		wrapper: toAddress("0xF965237c6b3f89f8C62B45b94097899E3562A830"),
		looksrare: ZERO_ADDRESS,
		looksrareV2: ZERO_ADDRESS,
		x2y2: ZERO_ADDRESS,
	},
	transferProxies: {
		nft: toAddress("0xF65eF65a95821A16E02973b1C2200FA58898e3c0"),
		erc20: toAddress("0x248B46BEB66b3078D771a9E7E5a0a0216d0d07ba"),
		erc721Lazy: toAddress("0xce4bf732f53A76C463aE8822be858017b02779c8"),
		erc1155Lazy: toAddress("0xdA12E4Ab1d731F29bF4Bff8f971579D95f8DDD07"),
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
		erc721: toAddress("0xC699FB932c1bD7235C7ED19388f26A2428224AED"),
		erc1155: toAddress("0xdA12E4Ab1d731F29bF4Bff8f971579D95f8DDD07"),
	},
	cryptoPunks: {
		marketContract: ZERO_ADDRESS,
		wrapperContract: ZERO_ADDRESS,
	},
	sudoswap: {
		pairFactory: ZERO_ADDRESS,
		pairRouter: ZERO_ADDRESS,
	},
	weth: toAddress("0x3fB787101DC6Be47cfe18aeEe15404dcC842e6AF"),
	auction: ZERO_ADDRESS,
}
