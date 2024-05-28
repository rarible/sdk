import { toAddress, ZERO_ADDRESS } from "@rarible/types"
import { id32 } from "../common/id"
import type { EthereumConfig } from "./type"
import { FEE_CONFIG_URL } from "./common"

export const astarKyotoConfig: EthereumConfig = {
	basePath: "https://testnet-astarzkevm-api.rarible.org",
	environment: "testnet",
	chainId: 1998,
	exchange: {
		v1: ZERO_ADDRESS,
		v2: toAddress("0x41407B447Fb5425187A9BCA3a062644EF2410F8D"),
		openseaV1: ZERO_ADDRESS,
		wrapper: toAddress("0x6667b5ce062115651b0a6f499ac3f24A2DdFCB72"),
		looksrare: ZERO_ADDRESS,
		looksrareV2: ZERO_ADDRESS,
		x2y2: ZERO_ADDRESS,
	},
	transferProxies: {
		nft: toAddress("0xB7979d08657f37C14659dbd8b45FBA91c0780780"),
		erc20: toAddress("0x6F6Cdf267F98eDF9a098864B91A114fD03623462"),
		erc721Lazy: toAddress("0xd786eBeD505D010D4f8127Cd825511E887c65A2A"),
		erc1155Lazy: toAddress("0x4fEB488209d2A0A71fEef28E5fA306F15b2D5FEa"),
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
		erc721: toAddress("0x4e045aBF1e239BfA224c8DCb8F889C3d447D3804"),
		erc1155: toAddress("0x927b8510Bf3108BF35aD6d60316C2f8dAB1BCD9A"),
	},
	cryptoPunks: {
		marketContract: ZERO_ADDRESS,
		wrapperContract: ZERO_ADDRESS,
	},
	sudoswap: {
		pairFactory: ZERO_ADDRESS,
		pairRouter: ZERO_ADDRESS,
	},
	weth: toAddress("0x441325a0e1D5aC0d64C9cc790FcAbf9c5416a4a1"),
	auction: ZERO_ADDRESS,
}
