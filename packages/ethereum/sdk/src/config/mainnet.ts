import { toAddress, ZERO_ADDRESS } from "@rarible/types"
import { Blockchain } from "@rarible/api-client"
import { id32 } from "../common/id"
import type { EthereumConfig } from "./type"
import { FEE_CONFIG_URL } from "./common"

export const mainnetConfig: EthereumConfig = {
	basePath: "https://ethereum-api.rarible.org",
	chainId: 1,
	environment: "production",
	blockchain: Blockchain.ETHEREUM,
	exchange: {
		v1: toAddress("0x09EaB21c40743B2364b94345419138eF80f39e30"),
		v2: toAddress("0x9757F2d2b135150BBeb65308D4a91804107cd8D6"),
		openseaV1: toAddress("0x7be8076f4ea4a4ad08075c2508e481d6c946d12b"),
		wrapper: toAddress("0x9BDB46adb3972f9a5e2eadCcd009f0bf3e386845"),
		looksrare: toAddress("0x59728544B08AB483533076417FbBB2fD0B17CE3a"),
		looksrareV2: toAddress("0x0000000000E655fAe4d56241588680F86E3b2377"),
		x2y2: toAddress("0x74312363e45dcaba76c59ec49a7aa8a65a67eed3"),
	},
	transferProxies: {
		nft: toAddress("0x4fee7b061c97c9c496b01dbce9cdb10c02f0a0be"),
		erc20: toAddress("0xb8e4526e0da700e9ef1f879af713d691f81507d8"),
		erc721Lazy: toAddress("0xbb7829BFdD4b557EB944349b2E2c965446052497"),
		erc1155Lazy: toAddress("0x75a8B7c0B22D973E0B46CfBD3e2f6566905AA79f"),
		openseaV1: toAddress("0xe5c783ee536cf5e63e792988335c4255169be4e1"),
		cryptoPunks: toAddress("0xdf907c1b541b1843b511d115e2fef78a6a830772"),
	},
	feeConfigUrl: FEE_CONFIG_URL,
	openSea: {
		metadata: id32("RARIBLE"),
		proxyRegistry: toAddress("0xa5409ec958c83c3f309868babaca7c86dcb077c1"),
		merkleValidator: toAddress("0xbaf2127b49fc93cbca6269fade0f7f31df4c88a7"),
	},
	factories: {
		erc721: toAddress("0x6E42262978de5233C8d5B05B128C121fBa110DA4"),
		erc1155: toAddress("0xda5bfe0bd4443d63833c8f4e3284357299eae6bc"),
	},
	cryptoPunks: {
		marketContract: toAddress("0x6Ba6f2207e343923BA692e5Cae646Fb0F566DB8D"),
		wrapperContract: toAddress("0x282BDD42f4eb70e7A9D9F40c8fEA0825B7f68C5D"),
	},
	sudoswap: {
		pairFactory: toAddress("0xb16c1342E617A5B6E4b631EB114483FDB289c0A4"),
		pairRouter: toAddress("0x2b2e8cda09bba9660dca5cb6233787738ad68329"),
	},
	weth: toAddress("0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"),
	auction: ZERO_ADDRESS,
	looksrareOrderValidatorV2: toAddress("0x2a784a5b5C8AE0bd738FBc67E4C069dB4F4961B7"),
}
