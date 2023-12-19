import { toAddress, ZERO_ADDRESS } from "@rarible/types"
import { id32 } from "../common/id"
import type { EthereumConfig } from "./type"
import { FEE_CONFIG_URL } from "./common"

export const stagingEthereumConfig: EthereumConfig = {
	basePath: "https://staging-ethereum-api.rarible.org",
	chainId: 200500,
	exchange: {
		v1: ZERO_ADDRESS,
		v2: toAddress("0xC5696e98bE223E58D992Fd17225b37DF0FEFbEDf"),
		openseaV1: ZERO_ADDRESS,
		wrapper: toAddress("0x3EAA06308C859fC35A17b7944f20f14872462d3D"),
		looksrare: ZERO_ADDRESS,
		x2y2: ZERO_ADDRESS,
	},
	transferProxies: {
		nft: toAddress("0xdB4eDB8BEDD9C3017909aEB38F66707F8A19681B"),
		erc20: toAddress("0xD032fB7da01b16E181AaA59962C95f5b0e6e8381"),
		erc721Lazy: toAddress("0x3fB287d1Da10a10A87b613dED57230964e546719"),
		erc1155Lazy: toAddress("0x02c640F479ebCb92B078F51A4D8417fb1F3e10D7"),
		openseaV1: ZERO_ADDRESS,
		cryptoPunks: ZERO_ADDRESS,
	},
	feeConfigUrl: FEE_CONFIG_URL,
	openSea: {
		metadata: id32("RARIBLE"),
		proxyRegistry: ZERO_ADDRESS,
	},
	factories: {
		erc721: toAddress("0x319c4Bd373d3F16697d630153F5a2d526047FD8C"),
		erc1155: toAddress("0x957893927401ceF0878c538976a92a46C36ADc5f"),
	},
	cryptoPunks: {
		marketContract: ZERO_ADDRESS,
		wrapperContract: ZERO_ADDRESS,
	},
	sudoswap: {
		pairFactory: toAddress("0x525641e8f1140b8a215A0D9692BA2C9A7916e017"),
		pairRouter: toAddress("0xE27A07e9B293dC677e34aB5fF726073ECbeCA842"),
	},
	weth: toAddress("0xecd2728000E21aA49aA1F823242dc8C8bc5BB4aB"),
	rari: toAddress("0xc3994c5cbddf7ce38b8a2ec2830335fa8f3eea6a"),
	auction: ZERO_ADDRESS,
}
