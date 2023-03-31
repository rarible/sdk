import { toAddress, ZERO_ADDRESS } from "@rarible/types"
import { id32 } from "../common/id"
import type { EthereumConfig } from "./type"
import { FEE_CONFIG_URL } from "./common"

export const devEthereumConfig: EthereumConfig = {
	basePath: "https://dev-ethereum-api.rarible.org",
	chainId: 300500,
	exchange: {
		v1: toAddress("0x18033Ad24EBBd26E06a84d820dB1D252Fa0c00DB"),
		v2: toAddress("0x6aABb267a1c440CfB5C200Ebcd078Efa9249492A"),
		openseaV1: ZERO_ADDRESS,
		wrapper: toAddress("0x5Ace78C04f6D2656B89ce7FAA1f3C4d08fD6f1B7"),
		x2y2: ZERO_ADDRESS,
	},
	transferProxies: {
		nft: toAddress("0xc6f33b62A94939E52E1b074c4aC1A801B869fDB2"),
		erc20: toAddress("0x3586d3E6CDaE98d5F0eEaB737977Bc78406Da2BD"),
		erc721Lazy: toAddress("0xeC47DA9591FC24F5a5F401e8D275526Cc5eE5d37"),
		erc1155Lazy: toAddress("0x8812cFb55853da0968a02AaaEA84CD93EC4b42A1"),
		openseaV1: ZERO_ADDRESS,
		cryptoPunks: toAddress("0x44be0e540DfA005D97Fde86CdD058F7E1A71A317"),
	},
	feeConfigUrl: FEE_CONFIG_URL,
	openSea: {
		metadata: id32("RARIBLE"),
		proxyRegistry: ZERO_ADDRESS,
	},
	factories: {
		erc721: toAddress("0xD6313c8A2D1cDad7EE522135776Ff02EC98b1606"),
		erc1155: toAddress("0x3EAA06308C859fC35A17b7944f20f14872462d3D"),
	},
	cryptoPunks: {
		marketContract: ZERO_ADDRESS,
		wrapperContract: ZERO_ADDRESS,
	},
	sudoswap: {
		pairFactory: toAddress("0x3df054dA59B1c0D5d9CeE5EDc9B58798526023B5"),
		pairRouter: toAddress("0xc64E5D291CaEdF42b77fa9E50d5Fd46113227857"),
	},
	weth: toAddress("0x55eB2809896aB7414706AaCDde63e3BBb26e0BC6"),
	auction: ZERO_ADDRESS,
}
