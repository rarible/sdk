import { toAddress, ZERO_ADDRESS } from "@rarible/types"
import { id32 } from "../common/id"
import type { EthereumConfig } from "./type"
import { FEE_CONFIG_URL } from "./common"

export const mantleConfig: EthereumConfig = {
	basePath: "https://mantle-api.rarible.org",
	chainId: 5000,
	exchange: {
		v1: ZERO_ADDRESS,
		v2: toAddress("0x41407B447Fb5425187A9BCA3a062644EF2410F8D"),
		openseaV1: ZERO_ADDRESS,
		wrapper: toAddress("0x0141aC79eFD8e4305cE7785B4483C54d5E968995"),
		looksrare: ZERO_ADDRESS,
		looksrareV2: ZERO_ADDRESS,
		x2y2: ZERO_ADDRESS,
	},
	transferProxies: {
		nft: toAddress("0xA3AaA33E13Bd42fE5cBDefC72fB0a0888cfB44C0"),
		erc20: toAddress("0x5274ac9507b20aC14e215B098479bd69733fA98A"),
		erc721Lazy: toAddress("0xc0C8d44A78605E4C221C9506DA737bB2A5dfd537"),
		erc1155Lazy: toAddress("0x2047f99EFa18009ceA518AC99cEE8e2151D53eDc"),
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
		erc721: toAddress("0x465d62a669E98517e08e4E3D809A28FAF3DfbAE1"),
		erc1155: toAddress("0x16911a36a56f828f17632cD4915614Dd5c7a45e0"),
	},
	cryptoPunks: {
		marketContract: ZERO_ADDRESS,
		wrapperContract: ZERO_ADDRESS,
	},
	sudoswap: {
		pairFactory: ZERO_ADDRESS,
		pairRouter: ZERO_ADDRESS,
	},
	weth: toAddress("0xdeaddeaddeaddeaddeaddeaddeaddeaddead1111"),
	auction: ZERO_ADDRESS,
	looksrareOrderValidatorV2: ZERO_ADDRESS,
}
