import { toAddress, ZERO_ADDRESS } from "@rarible/types"
import { id32 } from "../common/id"
import type { EthereumConfig } from "./type"
import { FEE_CONFIG_URL } from "./common"

export const testnetEthereumConfig: EthereumConfig = {
	basePath: "https://testnet-ethereum-api.rarible.org",
	chainId: 11155111,
	environment: "testnet",
	exchange: {
		v1: ZERO_ADDRESS,
		v2: toAddress("0x3e52D660b69d1bDacb6C513cE085D924F5Cb9c77"),
		openseaV1: ZERO_ADDRESS,
		wrapper: toAddress("0x1554aDA53194B961016931A2E86C80D09a816209"),
		looksrare: ZERO_ADDRESS,
		looksrareV2: toAddress("0x34098cc15a8a48Da9d3f31CC0F63F01f9aa3D9F3"),
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
		merkleValidator: ZERO_ADDRESS,
	},
	factories: {
		erc721: toAddress("0xB020bA7fcF43DCc59eF0103624BD6FADE66d105E"),
		erc1155: toAddress("0x166F6180170f438Ddc38050a2B708d38c0890956"),
	},
	cryptoPunks: {
		marketContract: ZERO_ADDRESS,
		wrapperContract: ZERO_ADDRESS,
	},
	sudoswap: {
		pairFactory: toAddress("0xd96B8cd321176D95C77B2Ba6bfC007659c6CdceB"),
		pairRouter: toAddress("0x72d0Ee6B28553b048442a9c8DAD6eA33806e9357"),
	},
	weth: toAddress("0x7b79995e5f793a07bc00c21412e50ecae098e7f9"),
	auction: ZERO_ADDRESS,
	looksrareOrderValidatorV2: toAddress("0x0bc129E4c1f8D7b5583eAbAeb1F7468935B6ec0C"),
}
