import { toAddress, ZERO_ADDRESS } from "@rarible/types"
import { id32 } from "../common/id"
import type { EthereumConfig } from "./type"
import { FEE_CONFIG_URL } from "./common"

export const polygonAmoyConfig: EthereumConfig = {
	basePath: "https://testnet-polygon-api.rarible.org",
	chainId: 80002,
	environment: "testnet",
	exchange: {
		v1: ZERO_ADDRESS,
		v2: toAddress("0x3e52D660b69d1bDacb6C513cE085D924F5Cb9c77"),
		openseaV1: ZERO_ADDRESS,
		wrapper: toAddress("0x2FCE8435F0455eDc702199741411dbcD1B7606cA"),
		x2y2: ZERO_ADDRESS,
	},
	transferProxies: {
		nft: toAddress("0xA094E566b61b3c2D88ACf7Cc15e3Dd0FA83F32af"),
		erc20: toAddress("0xB8863180CAC2d0Ab665e5968C0De25298A1D8CEe"),
		erc721Lazy: toAddress("0xa2eEBb837aEF89369Ad117568d75348e6174520e"),
		erc1155Lazy: toAddress("0xC5BBd75789bD007784A0046094d19aCeA1A79eB1"),
		openseaV1: ZERO_ADDRESS,
		cryptoPunks: ZERO_ADDRESS,
	},
	feeConfigUrl: FEE_CONFIG_URL,
	openSea: {
		metadata: id32("RARIBLE"),
		proxyRegistry: ZERO_ADDRESS,
	},
	factories: {
		erc721: toAddress("0x18a2553ef1aaE12d9cd158821319e26A62feE90E"),
		erc1155: toAddress("0xc9eB416CDb5cc2aFC09bb75393AEc6dBA4E5C84a"),
	},
	cryptoPunks: {
		marketContract: ZERO_ADDRESS,
		wrapperContract: ZERO_ADDRESS,
	},
	sudoswap: {
		pairFactory: ZERO_ADDRESS,
		pairRouter: ZERO_ADDRESS,
	},
	weth: toAddress("0x35da2a468dc7b2c20965235d4a60e2a2a9dace8f"),
	auction: ZERO_ADDRESS,
}
