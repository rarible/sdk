import { toAddress, ZERO_ADDRESS } from "@rarible/types"
import { id32 } from "../common/id"
import type { EthereumConfig } from "./type"
import { FEE_CONFIG_URL } from "./common"

export const mantleTestnetConfig: EthereumConfig = {
	basePath: "https://testnet-mantle-api.rarible.org",
	chainId: 5001,
	environment: "testnet",
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
		nft: toAddress("0xF1cb795B7eA59a9213a790f868104c11a14690Fa"),
		erc20: toAddress("0xa90e536A492aef0d57e6d295FA17687c3ca93347"),
		erc721Lazy: toAddress("0x61512179F6a16bEC0D259d8010CC0485CE363868"),
		erc1155Lazy: toAddress("0x3e52D660b69d1bDacb6C513cE085D924F5Cb9c77"),
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
		erc721: toAddress("0x4492608238eB09c7AD036e9C089538a7286B8985"),
		erc1155: toAddress("0x552dcDddEd58DAfC95AB1231A9a46E15c34E211A"),
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
