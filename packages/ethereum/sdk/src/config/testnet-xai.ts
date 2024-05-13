import { toAddress, ZERO_ADDRESS } from "@rarible/types"
import { Blockchain } from "@rarible/api-client"
import { id32 } from "../common/id"
import type { EthereumConfig } from "./type"
import { FEE_CONFIG_URL } from "./common"
export const xaiTestnetConfig: EthereumConfig = {
	basePath: "https://testnet-xai-api.rarible.org",
	chainId: 37714555429,
	environment: "testnet",
	blockchain: Blockchain.XAI,
	exchange: {
		v1: ZERO_ADDRESS,
		v2: toAddress("0x61512179F6a16bEC0D259d8010CC0485CE363868"),
		openseaV1: ZERO_ADDRESS,
		wrapper: toAddress("0xc798B273FaF23932Cf11177402C10C9b44D30Da2"),
		looksrare: ZERO_ADDRESS,
		looksrareV2: ZERO_ADDRESS,
		x2y2: ZERO_ADDRESS,
	},
	transferProxies: {
		nft: toAddress("0x00C74eD067Cea48F1D6F7D00aBABa3C1D5B2598b"),
		erc20: toAddress("0xA094E566b61b3c2D88ACf7Cc15e3Dd0FA83F32af"),
		erc721Lazy: toAddress("0xB8863180CAC2d0Ab665e5968C0De25298A1D8CEe"),
		erc1155Lazy: toAddress("0xa2eEBb837aEF89369Ad117568d75348e6174520e"),
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
		erc721: toAddress("0xe10605b2026884aCc669C2A9Cd4A5ec5f5FFf494"),
		erc1155: toAddress("0x57B3f3b79F64c475a37E6c493BAA8E6E7C5F748e"),
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
