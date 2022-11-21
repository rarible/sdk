import { toAddress, ZERO_ADDRESS } from "@rarible/types"
import { id32 } from "../common/id"
import type { EthereumConfig } from "./type"
import { FEE_CONFIG_URL } from "./common"

export const stagingPolygonConfig: EthereumConfig = {
	basePath: "https://staging-polygon-api.rarible.org",
	chainId: 200501,
	exchange: {
		v1: ZERO_ADDRESS,
		v2: toAddress("0x6aABb267a1c440CfB5C200Ebcd078Efa9249492A"),
		openseaV1: ZERO_ADDRESS,
		wrapper: toAddress("0xE63941f52ecbA57d731bEd5447cd5d392468Ba7F"),
		x2y2: ZERO_ADDRESS,
	},
	transferProxies: {
		nft: toAddress("0xc6f33b62A94939E52E1b074c4aC1A801B869fDB2"),
		erc20: toAddress("0x3586d3E6CDaE98d5F0eEaB737977Bc78406Da2BD"),
		erc721Lazy: toAddress("0xeC47DA9591FC24F5a5F401e8D275526Cc5eE5d37"),
		erc1155Lazy: toAddress("0x8812cFb55853da0968a02AaaEA84CD93EC4b42A1"),
		openseaV1: ZERO_ADDRESS,
		cryptoPunks: ZERO_ADDRESS,
	},
	feeConfigUrl: FEE_CONFIG_URL,
	openSea: {
		metadata: id32("RARIBLE"),
		proxyRegistry: ZERO_ADDRESS,
	},
	factories: {
		erc721: toAddress("0x6972347e66A32F40ef3c012615C13cB88Bf681cc"),
		erc1155: toAddress("0x44be0e540DfA005D97Fde86CdD058F7E1A71A317"),
	},
	cryptoPunks: {
		marketContract: ZERO_ADDRESS,
		wrapperContract: ZERO_ADDRESS,
	},
	sudoswap: {
		pairFactory: toAddress("0x31C827f06E10e4999eb88c193669d408eF597B3D"),
		pairRouter: toAddress("0xbDC9d365aD6131D1078409521e2432b154439F05"),
	},
	weth: toAddress("0x85de069e16a42880c57b0D6451D6C770EC1D3Bf7"),
	auction: ZERO_ADDRESS,
}
