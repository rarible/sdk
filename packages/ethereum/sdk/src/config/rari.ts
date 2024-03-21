import { toAddress, ZERO_ADDRESS } from "@rarible/types"
import { id32 } from "../common/id"
import type { EthereumConfig } from "./type"
import { FEE_CONFIG_URL } from "./common"

export const rariMainnetConfig: EthereumConfig = {
	basePath: "https://rari-api.rarible.org",
	chainId: 1380012617,
	environment: "production",
	exchange: {
		v1: ZERO_ADDRESS,
		v2: toAddress("0x10CCBf49617ECB7A8262065853D6C93Ad42C3C2C"),
		openseaV1: ZERO_ADDRESS,
		wrapper: toAddress("0xd37DC0CD86Dfa9B2B57CD7DFA8B6AA0092a9517d"),
		looksrare: ZERO_ADDRESS,
		looksrareV2: ZERO_ADDRESS,
		x2y2: ZERO_ADDRESS,
	},
	transferProxies: {
		nft: toAddress("0xce4bf732f53A76C463aE8822be858017b02779c8"),
		erc20: toAddress("0x1CC22424f2B84791cb99c141A68CD2a44Cf35398"),
		erc721Lazy: toAddress("0xBCE7d7fbA750B1E9e0511C67b1F38C07EbfEFE63"),
		erc1155Lazy: toAddress("0x30fc6eed1d302F5f5C4a8aa58047d1a730b3Cc91"),
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
		erc721: toAddress("0xdA12E4Ab1d731F29bF4Bff8f971579D95f8DDD07"),
		erc1155: toAddress("0xEA26e060cCc11C840e6107cfca0B41c45Ce6a5a2"),
	},
	cryptoPunks: {
		marketContract: ZERO_ADDRESS,
		wrapperContract: ZERO_ADDRESS,
	},
	sudoswap: {
		pairFactory: ZERO_ADDRESS,
		pairRouter: ZERO_ADDRESS,
	},
	weth: toAddress("0xf037540e51D71b2D2B1120e8432bA49F29EDFBD0"),
	auction: ZERO_ADDRESS,
	looksrareOrderValidatorV2: ZERO_ADDRESS,
}
